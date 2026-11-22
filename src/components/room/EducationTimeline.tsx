import { Cormorant_Garamond } from "next/font/google";
import { NoteText } from "@/components/NoteText";
import { profile } from "@/data/profile";

/** Engraved-certificate serif, only for the diploma cards. */
const diplomaSerif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], style: ["normal", "italic"] });

/** The graduation cap's black and its tassel's gold, so the timeline reads as the side of the cap itself. */
const CAP_BLACK = "#22262e";
const GOLD = "#e0a72e";
const PAPER = "#f1e6cf";
const PAPER_EDGE = "#d9c7a3";
const WAX = "#b42a24";

/** A small gold flourish for each corner of the frame, drawn for the top-left and mirrored for the others. */
function Corner({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`absolute size-5 ${className}`} fill="none" stroke={GOLD} strokeWidth="1.4">
      <path d="M2 14V2h12" />
      <path d="M6 10c0-2.2 1.8-4 4-4" />
      <circle cx="6" cy="6" r="1.3" fill={GOLD} stroke="none" />
    </svg>
  );
}

/** Red wax seal pressed over two V-cut gold satin ribbon tails, as on the rolled diplomas on the shelf. */
function WaxSeal() {
  return (
    <div aria-hidden className="absolute -right-3 -bottom-5 size-16 sm:size-[4.5rem]">
      <svg viewBox="0 0 72 72" className="size-full drop-shadow-md">
        <path d="M27 40 L17 70 L23 64 L27 71 L34 44Z" fill="#f0bb3c" />
        <path d="M45 40 L55 70 L49 64 L45 71 L38 44Z" fill="#d99f27" />
        <path
          d="M36 6c4 0 5 3 9 4s7-1 9 3 1 6 3 9 5 4 4 8-4 4-4 8 3 6 0 9-6 1-9 3-3 6-7 7-6-2-9-2-6 3-9 1-2-6-5-8-7-1-8-5 3-6 3-9-3-6-1-9 6-2 8-5 0-7 4-9 6 1 9 0 3-4 7-4z"
          fill={WAX}
        />
        <circle cx="36" cy="33" r="15" fill="none" stroke="#8e1f1a" strokeWidth="1.6" />
        <circle cx="36" cy="33" r="12.5" fill="none" stroke="#d2554d" strokeOpacity="0.55" strokeWidth="0.8" />
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx="36" cy="26" rx="2.4" ry="5" fill="#8e1f1a" transform={`rotate(${i * 60} 36 33)`} />
        ))}
        <circle cx="36" cy="33" r="2.6" fill="#d2554d" />
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

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: CAP_BLACK }}>
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-28 sm:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
          Education
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">My timeline</h1>

        <ol className="relative mt-12">
          {/* The cord: a gold line down the left, ending in a tassel knot. */}
          <span aria-hidden className="absolute top-2 bottom-0 left-[7px] w-0.5" style={{ background: GOLD }} />
          {steps.map((step, i) => (
            <li
              key={i}
              className="relative pb-10 pl-10 transition-all duration-700 ease-out"
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "none" : "translateY(16px)",
                transitionDelay: active ? `${150 + i * 140}ms` : "0ms",
              }}
            >
              <span
                aria-hidden
                className="absolute top-1.5 left-0 size-4 rounded-full border-2"
                style={{ borderColor: GOLD, background: i === 0 ? GOLD : CAP_BLACK }}
              />
              <p className="text-sm font-medium" style={{ color: GOLD }}>
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
                <div className="relative border-[3px] border-double px-6 pt-7 pb-9 text-center sm:px-10" style={{ borderColor: GOLD }}>
                  <Corner className="top-1 left-1" />
                  <Corner className="top-1 right-1 -scale-x-100" />
                  <Corner className="bottom-1 left-1 -scale-y-100" />
                  <Corner className="right-1 bottom-1 -scale-100" />

                  <p className={`${diplomaSerif.className} text-xs font-semibold tracking-[0.35em] uppercase`} style={{ color: "#9a7320" }}>
                    Diploma
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
                <WaxSeal />
              </div>
            </li>
          ))}
          <li aria-hidden className="relative h-0">
            <span className="absolute -top-1 left-[3px] size-2.5 rounded-full" style={{ background: GOLD }} />
          </li>
        </ol>
      </div>

      <button
        type="button"
        onClick={onLeave}
        tabIndex={active ? 0 : -1}
        className="fixed right-5 bottom-5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/20 focus-visible:outline-white"
      >
        ← Back to the room <span className="opacity-60">(Esc)</span>
      </button>
    </div>
  );
}
