"use client";

import { Equalizer } from "@/components/albums/Equalizer";
import { NowPlayingContent } from "./NowPlayingContent";

/** Right-hand panel on large screens. */
export function NowPlayingPanel() {
  return (
    <aside
      aria-labelledby="now-playing-heading"
      className="scrollbar-thin hidden overflow-y-auto rounded-2xl bg-ink-900 p-5 xl:block"
    >
      <h2
        id="now-playing-heading"
        className="mb-5 flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-muted uppercase"
      >
        <Equalizer className="text-signal" /> Now Playing
      </h2>
      <NowPlayingContent />
    </aside>
  );
}
