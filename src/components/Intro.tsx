"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Intro: a logo reveal. Three shapes fly in and land as the mark (a submarine
 * porthole with an eye behind it, the RER D sign, a piano keyboard), then the
 * name slides out from behind the mark. The eye then stares at the camera and
 * its pupil clears into a window onto the live site, drawn small inside it. The
 * camera zooms into the pupil, and the site grows with it until it fills the screen.
 *
 * It only plays when the inline script in the root layout has set
 * `data-intro="play"` on <html> (every full page load, motion allowed).
 */

/* ---------- The mark, in viewBox units (225 x 230) ---------- */

const INK = "#15201b";
const MARK_WIDTH = 225;
const MARK_HEIGHT = 230;
const PIVOT = `${MARK_WIDTH / 2} ${MARK_HEIGHT / 2}`; // the shapes turn around the centre of the mark

const bolts = Array.from({ length: 8 }, (_, i) => {
  const angle = ((i * 45 + 22.5) * Math.PI) / 180;
  // Rounded, so the server and the browser print the same numbers.
  return { x: (55 + 47 * Math.cos(angle)).toFixed(2), y: (55 + 47 * Math.sin(angle)).toFixed(2) };
});

const WHITE_KEYS = 7;
const KEY = MARK_WIDTH / WHITE_KEYS;
const BLACK_KEYS = [0, 1, 3, 4, 5]; // a black key sits after these white keys: C D . F G A .

const EYE = { x: 55, y: 56, pupil: 6.5 }; // centre of the eye and radius of its pupil

/* ---------- The logo reveal ----------
 * Times are shares of DURATION, taken from the reference logo reveal.
 */

const DURATION = 3800; // time base of the reveal, in milliseconds

/** Where each shape starts (offset in viewBox units), how much it turns on the way, and when it leaves. */
const FLIGHTS = [
  { from: [-460, -300], turn: -120, delay: 0.04 }, // porthole
  { from: [440, -360], turn: 110, delay: 0.1 }, // RER D
  { from: [-60, 420], turn: 0, delay: 0.16 }, // piano
];

const WORD = [0.3, 0.52]; // the name slides out
const SWELL = [0.3, 0.84]; // the logo grows by 4% while it holds

/* ---------- The zoom into the eye ----------
 * One camera move, in milliseconds since the intro started. The eye stops looking
 * around, its pupil clears to show the site inside it, then the zoom speeds up
 * until the cut and slows down to rest. The site is pinned to the pupil the whole
 * way, so it is always the same picture, only bigger.
 */

const STARE = 1650; // the eye stops looking around, so the pupil is centred and still when it opens
const REVEAL = [1950, 2250]; // the pupil clears and shows the site inside it
const ZOOM_START = 2100; // the camera starts moving towards the pupil
const ZOOM_CUT = 3200; // top speed, then the zoom slows down
const ZOOM_END = 4600; // the site is at rest, at its real size
const ZOOM_SETTLE = 210; // how fast the zoom slows down after the cut: lower is snappier
const FEATHER = 0.28; // while it is small, the site's edges fade out over this share of the screen

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
const span = (time: number, [from, to]: number[]) => clamp((time - from) / (to - from));

/** A spring that overshoots once and settles (stiffness 170, damping 13, mass 1). `seconds` since release. */
function spring(seconds: number) {
  if (seconds <= 0) return 0;
  const decay = 6.5; // damping / 2
  const frequency = Math.sqrt(170 - decay * decay);
  return 1 - Math.exp(-decay * seconds) * (Math.cos(frequency * seconds) + (decay / frequency) * Math.sin(frequency * seconds));
}

/** CSS-style cubic-bezier easing. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const coords = (a: number, b: number) => (t: number) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
  const x = coords(x1, x2);
  const y = coords(y1, y2);
  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (x(mid) < progress) low = mid;
      else high = mid;
    }
    return y((low + high) / 2);
  };
}

const expoOut = bezier(0.16, 1, 0.3, 1);
const sine = (progress: number) => 0.5 - Math.cos(Math.PI * progress) / 2;

/**
 * Runs before the first paint: decides whether the intro plays, so people who
 * prefer reduced motion never see a flash of it.
 */
const introScript = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.dataset.intro="play"}catch(e){}})()`;

export function IntroGate() {
  // The server sends a real script. In the browser React must not treat it as one to run again.
  const type = typeof window === "undefined" ? "text/javascript" : "text/plain";
  return <script type={type} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: introScript }} />;
}

export function Intro() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const shapeRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const word = wordRef.current;
    const shapes = shapeRefs.current;
    const site = document.getElementById("site");
    if (root.dataset.intro !== "play" || !overlay || !logo || !word || !site) return;

    const mark = overlay.querySelector<SVGSVGElement>(".intro-mark");
    const iris = overlay.querySelector<SVGGElement>(".intro-iris");
    const pupil = overlay.querySelector<SVGCircleElement>(".intro-pupil");
    const glint = overlay.querySelector<SVGCircleElement>(".intro-glint");
    if (!mark || !iris || !pupil || !glint) return;

    let raf = 0;

    const resetSite = () => {
      for (const prop of ["opacity", "transform", "transform-origin", "mask-image", "-webkit-mask-image", "mask-composite", "-webkit-mask-composite"]) {
        site.style.removeProperty(prop);
      }
      document.body.style.removeProperty("background-color");
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", finish);
      window.removeEventListener("keydown", finish);
    };

    function finish() {
      stop();
      resetSite();
      root.dataset.intro = "done";
      setDone(true);
      if (window.location.hash) {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
      }
    }

    // Everything scales around the pupil, so the camera can zoom straight into it.
    const logoBox = logo.getBoundingClientRect();
    const markBox = mark.getBoundingClientRect();
    const unit = markBox.height / MARK_HEIGHT; // pixels per unit of the mark's drawing
    const eyeX = markBox.left + EYE.x * unit;
    const eyeY = markBox.top + EYE.y * unit;
    const pupilRadius = EYE.pupil * unit;
    logo.style.transformOrigin = `${(eyeX - logoBox.left).toFixed(2)}px ${(eyeY - logoBox.top).toFixed(2)}px`;

    // The camera also pans, so the pupil ends in the middle of the screen and the site grows from there.
    const centreX = window.innerWidth / 2;
    const centreY = window.innerHeight / 2;
    site.style.transformOrigin = `${centreX}px ${centreY}px`;

    // Zoom, as the logarithm of the scale. By the end the pupil must cover the whole screen.
    const ramp = ZOOM_CUT - ZOOM_START;
    const reach = Math.log((1.15 * Math.hypot(centreX, centreY)) / pupilRadius);
    const atCut = reach / (1 + (3 * ZOOM_SETTLE) / ramp); // zoom reached at the cut
    const glide = ((3 * atCut) / ramp) * ZOOM_SETTLE; // zoom still to come after the cut, at matching speed
    const tail = Math.exp(-(ZOOM_END - ZOOM_CUT) / ZOOM_SETTLE);
    /** Goes from 1 at the cut to exactly 0 at the end. */
    const remaining = (ms: number) => (Math.exp(-(ms - ZOOM_CUT) / ZOOM_SETTLE) - tail) / (1 - tail);

    // Radius of the pupil on screen at the end. The site is scaled by the pupil's radius over this,
    // so it is at its real size exactly when the zoom ends, and it grows smoothly with the eye.
    const holeEnd = pupilRadius * (1 + 0.04 * sine(span(ZOOM_END / DURATION, SWELL))) * Math.exp(reach);

    // The pupil is a little wider than the screen, so a rim around the site shows inside it.
    // That rim takes the colour at the edge of the page, and the site's edges fade into it,
    // so the page has no hard frame inside the eye.
    const edge = () => {
      for (const element of document.elementsFromPoint(1, 1)) {
        if (!site.contains(element)) continue;
        const colour = getComputedStyle(element).backgroundColor;
        if (colour !== "transparent" && colour !== "rgba(0, 0, 0, 0)") return colour;
      }
      return getComputedStyle(document.body).backgroundColor;
    };
    document.body.style.backgroundColor = edge();
    site.style.setProperty("mask-composite", "intersect");
    site.style.setProperty("-webkit-mask-composite", "source-in");
    const shortSide = Math.min(window.innerWidth, window.innerHeight);

    /** Stops a looping CSS animation where it is and eases the element back to rest. */
    const rest = (element: SVGElement, prop: "translate" | "scale", value: string) => {
      const current = getComputedStyle(element).getPropertyValue(prop);
      element.style.animation = "none";
      element.style.setProperty(prop, current);
      element.getBoundingClientRect();
      element.style.transition = `${prop} 350ms ease-in-out`;
      element.style.setProperty(prop, value);
    };
    let staring = false;

    const start = performance.now();

    const frame = (now: number) => {
      const ms = Math.min(now - start, ZOOM_END);
      const time = ms / DURATION;

      FLIGHTS.forEach((flight, i) => {
        const shape = shapes[i];
        if (!shape) return;
        const landed = spring(((time - flight.delay) * DURATION) / 1000);
        const left = 1 - landed; // goes slightly negative: that is the overshoot
        shape.setAttribute(
          "transform",
          `translate(${(flight.from[0] * left).toFixed(2)} ${(flight.from[1] * left).toFixed(2)}) rotate(${(flight.turn * left).toFixed(2)} ${PIVOT})`,
        );
        shape.style.opacity = clamp(landed * 3).toFixed(3);
      });

      const out = expoOut(span(time, WORD));
      word.style.transform = `translate3d(${(-104 * (1 - out)).toFixed(2)}%,0,0)`;

      // The eye stops looking around and stares at the camera as it comes closer.
      if (!staring && ms >= STARE) {
        staring = true;
        rest(iris, "translate", "0px 0px");
        rest(pupil, "scale", "1");
      }

      const approach = clamp((ms - ZOOM_START) / ramp);
      const zoom = ms < ZOOM_CUT ? atCut * approach ** 3 : atCut + glide * (1 - remaining(ms));
      const scale = (1 + 0.04 * sine(span(time, SWELL))) * Math.exp(zoom);
      const pan = sine(approach);
      const x = eyeX + (centreX - eyeX) * pan;
      const y = eyeY + (centreY - eyeY) * pan;
      // A flat transform on purpose: the logo is redrawn at every size, so it stays sharp however close we get.
      logo.style.transform = `translate(${(x - eyeX).toFixed(2)}px,${(y - eyeY).toFixed(2)}px) scale(${scale.toFixed(4)})`;

      // The pupil is a window onto the site, which sits in it, centred, at the pupil's scale.
      const open = span(ms, REVEAL);
      if (open > 0) {
        const radius = pupilRadius * scale;
        const hole = `radial-gradient(circle at ${x.toFixed(2)}px ${y.toFixed(2)}px, rgba(0,0,0,${(1 - open).toFixed(3)}) ${Math.max(radius - 0.75, 0).toFixed(2)}px, #000 ${radius.toFixed(2)}px)`;
        overlay.style.setProperty("-webkit-mask-image", hole);
        overlay.style.setProperty("mask-image", hole);
        pupil.style.opacity = (1 - open).toFixed(3); // otherwise its edge leaves a dark line around the window
        glint.style.opacity = (1 - open).toFixed(3); // it overlaps the pupil, and would be cut by the window
        site.style.opacity = "1";
        const size = radius / holeEnd;
        site.style.transform = `translate(${(x - centreX).toFixed(2)}px,${(y - centreY).toFixed(2)}px) scale(${size.toFixed(6)})`;
        // The fade narrows to nothing as the site reaches its real size.
        const feather = (FEATHER * shortSide * Math.sqrt(Math.max(1 - size, 0))).toFixed(1);
        const fadeEdges = ["right", "bottom"]
          .map((side) => `linear-gradient(to ${side}, transparent, #000 ${feather}px, #000 calc(100% - ${feather}px), transparent)`)
          .join(",");
        site.style.setProperty("-webkit-mask-image", fadeEdges);
        site.style.setProperty("mask-image", fadeEdges);
      }

      if (ms >= ZOOM_END) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener("pointerdown", finish);
    window.addEventListener("keydown", finish);

    return () => {
      stop();
      resetSite();
    };
  }, []);

  if (done) return null;

  return (
    <div ref={overlayRef} className="intro" aria-hidden="true">
      <div ref={logoRef} className="intro-logo">
        <svg className="intro-mark" viewBox={`0 0 ${MARK_WIDTH} ${MARK_HEIGHT}`}>
          <defs>
            <radialGradient id="intro-water" cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#2a7f9c" />
              <stop offset="1" stopColor="#0f3445" />
            </radialGradient>
            <clipPath id="intro-keys">
              <rect x="0" y="120" width={MARK_WIDTH} height="110" rx="5" />
            </clipPath>
          </defs>

          {/* Porthole of a submarine, with an eye looking around behind the glass */}
          <g
            ref={(node) => {
              shapeRefs.current[0] = node;
            }}
            className="intro-shape"
          >
            <circle cx="55" cy="55" r="55" fill={INK} />
            {bolts.map((bolt) => (
              <circle key={`${bolt.x}-${bolt.y}`} cx={bolt.x} cy={bolt.y} r="3.3" fill="#a9b8b0" />
            ))}
            <circle cx="55" cy="55" r="40" fill="#a9b8b0" />
            <circle cx="55" cy="55" r="37" fill="url(#intro-water)" />
            <circle cx="55" cy="56" r="28" fill="#f6f1e7" />
            <g className="intro-iris">
              <circle cx="55" cy="56" r="14.5" fill="#f2903d" stroke="#c2571a" strokeWidth="3" />
              <circle className="intro-pupil" cx="55" cy="56" r="6.5" fill={INK} />
              <circle className="intro-glint" cx="50" cy="51" r="2.6" fill="#fff" />
            </g>
            <path
              d="M25.1 41.05A33 33 0 0 1 43.71 23.99"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.5"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* RER D sign */}
          <g
            ref={(node) => {
              shapeRefs.current[1] = node;
            }}
            className="intro-shape"
          >
            <rect x="115" y="0" width="110" height="110" rx="22" fill="#00814f" />
            <path
              fill="#fff"
              fillRule="evenodd"
              d="M143.5 24H165.5A31 31 0 0 1 165.5 86H143.5ZM157.5 37V73H165.5A18 18 0 0 0 165.5 37Z"
            />
          </g>

          {/* Piano keyboard */}
          <g
            ref={(node) => {
              shapeRefs.current[2] = node;
            }}
            className="intro-shape"
          >
            <g clipPath="url(#intro-keys)">
              <rect x="0" y="120" width={MARK_WIDTH} height="110" fill="#fff" />
              {Array.from({ length: WHITE_KEYS - 1 }, (_, i) => (
                <line key={i} x1={(i + 1) * KEY} x2={(i + 1) * KEY} y1="120" y2="230" stroke={INK} strokeWidth="3" />
              ))}
              {BLACK_KEYS.map((i) => (
                <rect key={i} x={(i + 1) * KEY - 8.5} y="120" width="17" height="76" rx="2.5" fill={INK} />
              ))}
              <rect x="0" y="120" width={MARK_WIDTH} height="24" fill={INK} />
            </g>
            <rect x="2" y="122" width={MARK_WIDTH - 4} height="106" rx="3" fill="none" stroke={INK} strokeWidth="4" />
          </g>
        </svg>

        <span className="intro-word font-display">
          <span ref={wordRef}>Alan Fresco</span>
        </span>
      </div>
    </div>
  );
}
