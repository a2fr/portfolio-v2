import type { Track } from "@/types/album";
import { Reveal } from "@/components/motion/Reveal";

/** The case study, told as a tracklist. */
export function Tracklist({ tracks, labelledBy }: { tracks: Track[]; labelledBy: string }) {
  return (
    <ol aria-labelledby={labelledBy} className="flex flex-col">
      {tracks.map((track, i) => (
        <Reveal
          as="li"
          inView
          delay={Math.min(i * 0.05, 0.25)}
          key={track.title}
          className="group grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-ink-700/70 py-5 sm:grid-cols-[3.5rem_1fr]"
        >
          <span className="pt-1 font-mono text-sm text-faint transition-colors group-hover:text-signal">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-display text-2xl leading-tight sm:text-3xl">{track.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{track.notes}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
