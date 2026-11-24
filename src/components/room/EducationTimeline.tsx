"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Cormorant_Garamond } from "next/font/google";
import { NoteText } from "@/components/NoteText";
import { profile, type EducationEntry } from "@/data/profile";
import { useT } from "@/i18n/useT";

/** Engraved-certificate serif, only for the diploma cards. */
const diplomaSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

/** The graduation cap's black and its tassel's gold, so the timeline reads as the side of the cap itself. */
const CAP_BLACK = "#22262e";
const GOLD = "#e0a72e";
const PAPER = "#f1e6cf";
const PAPER_EDGE = "#d9c7a3";

/** Ribbon tails and wax for each seal, matching the rolls on the shelf ("inverse" takes the complementary hues). */
const SEALS: Record<
  EducationEntry["seal"],
  { ribbon: string; ribbonShade: string; wax: string; waxDark: string; waxLight: string }
> = {
  classic: { ribbon: "#f0bb3c", ribbonShade: "#d99f27", wax: "#b42a24", waxDark: "#8e1f1a", waxLight: "#d2554d" },
  inverse: { ribbon: "#3c71f0", ribbonShade: "#2758d9", wax: "#24b45a", waxDark: "#1a8e43", waxLight: "#4dd27f" },
};

/** A small gold flourish for each corner of the frame, drawn for the top-left and mirrored for the others. */
function Corner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`absolute size-5 ${className}`}
      fill="none"
      stroke={GOLD}
      strokeWidth="1.4"
    >
      <path d="M2 14V2h12" />
      <path d="M6 10c0-2.2 1.8-4 4-4" />
      <circle cx="6" cy="6" r="1.3" fill={GOLD} stroke="none" />
    </svg>
  );
}

const GOLD_LIGHT = "#f6d27a";
const GOLD_DARK = "#9a6d14";

/**
 * The cap's twisted gold cord: diagonal strands for the twist, under a side-to-side shade that rounds it.
 * Centred on x = 8px on a phone, on the middle of the page from md up, like the knots and the tassel.
 */
const ROPE_STYLE: React.CSSProperties = {
  backgroundImage: [
    `linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.18) 40%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.5))`,
    `repeating-linear-gradient(-58deg, ${GOLD_LIGHT} 0 2px, ${GOLD} 2px 4.5px, ${GOLD_DARK} 4.5px 6px)`,
  ].join(","),
  boxShadow: "0 0 6px rgba(224,167,46,0.25)",
};

/**
 * A knot tied in the cord where each diploma hangs: on the step's left edge on a phone, and from md up on the
 * edge facing the centred cord.
 */
function Knot({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden
      className={`absolute top-1 left-0 size-4 rounded-full ${side === "right" ? "md:-ml-2" : "md:right-0 md:left-auto md:-mr-2"}`}
      style={{
        background: `radial-gradient(circle at 35% 30%, ${GOLD_LIGHT}, ${GOLD} 45%, ${GOLD_DARK} 100%)`,
        boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
      }}
    >
      {/* The cord wrapping round the knot. */}
      <span
        className="absolute inset-x-0.5 top-1/2 h-px -translate-y-[3px] rounded-full"
        style={{ background: GOLD_DARK }}
      />
      <span
        className="absolute inset-x-0.5 top-1/2 h-px translate-y-[2px] rounded-full"
        style={{ background: GOLD_DARK }}
      />
    </span>
  );
}

/** The tassel the cord ends in: a knot, a bound head, then a flared skirt of threads, swaying from its knot. */
function Tassel({ cord }: { cord: React.CSSProperties }) {
  const threads = Array.from({ length: 13 }, (_, i) => i);
  return (
    <span aria-hidden className="absolute top-0 -left-2 h-[92px] w-8 md:left-1/2 md:-ml-4" style={cord}>
      <svg
        aria-hidden
        viewBox="0 0 32 92"
        className="tassel-sway absolute top-0 left-0 h-[92px] w-8 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <radialGradient id="tassel-ball" cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor={GOLD_LIGHT} />
            <stop offset="0.45" stopColor={GOLD} />
            <stop offset="1" stopColor={GOLD_DARK} />
          </radialGradient>
          <linearGradient id="tassel-shade" x1="0" x2="1">
            <stop offset="0" stopColor={GOLD_DARK} />
            <stop offset="0.4" stopColor={GOLD_LIGHT} />
            <stop offset="1" stopColor={GOLD_DARK} />
          </linearGradient>
        </defs>
        {/* Threads fanning out below the binding, each a slightly different length. */}
        {threads.map((i) => {
          const t = i / (threads.length - 1);
          const top = 10 + t * 12;
          const bottom = 3 + t * 26;
          const length = 86 + Math.round(Math.sin(i * 2.3) * 3);
          return (
            <path
              key={i}
              d={`M${top} 34 Q${(top + bottom) / 2} 60 ${bottom} ${length}`}
              stroke={i % 3 === 0 ? GOLD_DARK : i % 3 === 1 ? GOLD : GOLD_LIGHT}
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          );
        })}
        {/* Head: a rounded bell under the knot, then the wrapped binding. */}
        <path d="M11 14 Q8 26 9 34 H23 Q24 26 21 14 Z" fill="url(#tassel-shade)" />
        <rect x="8.5" y="29" width="15" height="5" rx="1.5" fill={GOLD_DARK} />
        <path d="M9 30.5 H23 M9 32.5 H23" stroke={GOLD_LIGHT} strokeOpacity="0.6" strokeWidth="0.6" />
        <circle cx="16" cy="10" r="6" fill="url(#tassel-ball)" />
      </svg>
    </span>
  );
}

/** Wax seal pressed over two V-cut satin ribbon tails, in the same colours as its rolled diploma on the shelf. */
function WaxSeal({ seal }: { seal: EducationEntry["seal"] }) {
  const c = SEALS[seal];
  return (
    <div aria-hidden className="absolute -right-3 -bottom-5 size-16 sm:size-[4.5rem]">
      <svg viewBox="0 0 72 72" className="size-full drop-shadow-md">
        <path d="M27 40 L17 70 L23 64 L27 71 L34 44Z" fill={c.ribbon} />
        <path d="M45 40 L55 70 L49 64 L45 71 L38 44Z" fill={c.ribbonShade} />
        <path
          d="M36 6c4 0 5 3 9 4s7-1 9 3 1 6 3 9 5 4 4 8-4 4-4 8 3 6 0 9-6 1-9 3-3 6-7 7-6-2-9-2-6 3-9 1-2-6-5-8-7-1-8-5 3-6 3-9-3-6-1-9 6-2 8-5 0-7 4-9 6 1 9 0 3-4 7-4z"
          fill={c.wax}
        />
        <circle cx="36" cy="33" r="15" fill="none" stroke={c.waxDark} strokeWidth="1.6" />
        <circle cx="36" cy="33" r="12.5" fill="none" stroke={c.waxLight} strokeOpacity="0.55" strokeWidth="0.8" />
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx="36" cy="26" rx="2.4" ry="5" fill={c.waxDark} transform={`rotate(${i * 60} 36 33)`} />
        ))}
        <circle cx="36" cy="33" r="2.6" fill={c.waxLight} />
      </svg>
    </div>
  );
}

/**
 * Education as a vertical timeline, shown once the camera has dived into the side of the graduation cap.
 * Most recent step at the top, from src/data/profile.ts.
 */
export function EducationTimeline({ active, onLeave }: { active: boolean; onLeave: () => void }) {
  const steps = profile.education;
  const t = useT();

  // The cord is dropped from above as we arrive and pulled back up as we leave: rope, knots and tassel all slide
  // by the same distance, enough to lift the tassel past the top of the content.
  const listRef = useRef<HTMLOListElement>(null);
  const [lift, setLift] = useState(4000);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => setLift(list.offsetTop + list.offsetHeight + 140);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);
  const cord: React.CSSProperties = {
    transform: active ? "none" : `translateY(${-lift}px)`,
    transition: active
      ? "transform 1300ms cubic-bezier(0.25, 1.12, 0.4, 1)" // falls, overshoots a touch, settles
      : "transform 550ms cubic-bezier(0.6, 0, 0.9, 0.45)", // yanked back up
  };

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: CAP_BLACK }}>
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-28 sm:px-8 md:max-w-5xl">
        {/* Clear of the cord, which runs down through this header from above the screen (past its left edge on
            a phone, down the middle from md up); drops in with it. */}
        <div className="pl-10 md:w-1/2 md:pr-10 md:pl-0" style={cord}>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
            {t.education}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{t.myTimeline}</h1>
        </div>

        <ol ref={listRef} className="relative mt-12">
          {/* The cord: the cap's twisted gold rope, falling from the top of the cap above the screen (its origin is
              never seen: the scroll box clips it), knotted at each diploma and ending in its tassel. */}
          <span
            aria-hidden
            className="absolute -top-[200vh] bottom-0 left-[5px] w-1.5 rounded-full md:left-1/2 md:-ml-[3px]"
            style={{ ...ROPE_STYLE, ...cord }}
          />
          {steps.map((step, i) => {
            // Each diploma hangs from its knot, so the whole step rides the cord down and back up with it. From md
            // up they alternate either side of the cord, most recent on the right, each tucked up beside the last.
            const side = i % 2 === 0 ? "right" : "left";
            return (
              <li
                key={i}
                className={`relative pb-10 pl-10 ${side === "right" ? "md:ml-[50%]" : "md:mr-[50%] md:pr-10 md:pl-0"} ${i > 0 ? "md:-mt-28" : ""}`}
                style={cord}
              >
                <Knot side={side} />
                <div>
                  <p
                    className={`text-sm font-medium ${side === "left" ? "md:text-right" : ""}`}
                    style={{ color: GOLD }}
                  >
                    <NoteText note={step.period} />
                  </p>
                  {/* The diploma: parchment sheet, gold double frame with corner flourishes, centred certificate text. */}
                  <div
                    className="relative mt-3 mr-3 mb-4 p-2 text-ink shadow-[0_14px_30px_rgba(0,0,0,0.45)]"
                    style={{
                      background: `radial-gradient(ellipse at center, ${PAPER} 55%, ${PAPER_EDGE} 130%)`,
                      transform: `rotate(${i % 2 ? 0.6 : -0.5}deg)`,
                    }}
                  >
                    <div
                      className="relative border-[3px] border-double px-6 pt-7 pb-9 text-center sm:px-10"
                      style={{ borderColor: GOLD }}
                    >
                      <Corner className="top-1 left-1" />
                      <Corner className="top-1 right-1 -scale-x-100" />
                      <Corner className="bottom-1 left-1 -scale-y-100" />
                      <Corner className="right-1 bottom-1 -scale-100" />

                      <p
                        className={`${diplomaSerif.className} text-xs font-semibold tracking-[0.35em] uppercase`}
                        style={{ color: "#9a7320" }}
                      >
                        {t.diploma}
                      </p>
                      <div aria-hidden className="mx-auto mt-2 flex w-24 items-center gap-2">
                        <span className="h-px flex-1" style={{ background: GOLD }} />
                        <span className="size-1.5 rotate-45" style={{ background: GOLD }} />
                        <span className="h-px flex-1" style={{ background: GOLD }} />
                      </div>
                      <h2 className={`${diplomaSerif.className} mt-3 text-2xl leading-tight font-bold sm:text-3xl`}>
                        <NoteText note={step.degree} />
                      </h2>
                      <p className={`${diplomaSerif.className} mt-2 text-lg italic`} style={{ color: "#5a4a2e" }}>
                        <NoteText note={step.school} />
                      </p>
                      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed" style={{ color: "#4a4234" }}>
                        <NoteText note={step.detail} />
                      </p>
                    </div>
                    <WaxSeal seal={step.seal} />
                  </div>
                </div>
              </li>
            );
          })}
          <li aria-hidden className="relative h-0">
            <Tassel cord={cord} />
          </li>
        </ol>
      </div>

      <button
        type="button"
        onClick={onLeave}
        tabIndex={active ? 0 : -1}
        className="fixed top-5 left-5 z-10 rounded-full bg-[#14161b]/85 px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/15 backdrop-blur hover:bg-[#14161b] focus-visible:outline-white"
      >
        ← {t.backToRoom} <span className="opacity-60 [@media(hover:none)]:hidden">(Esc)</span>
      </button>
    </div>
  );
}
