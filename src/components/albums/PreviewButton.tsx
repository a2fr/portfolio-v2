"use client";

import { motion } from "framer-motion";
import type { Album } from "@/types/album";
import { useNowPlaying } from "@/components/layout/NowPlayingProvider";

/** Loads a release into the Now Playing panel without leaving the page. */
export function PreviewButton({ album, size = "md" }: { album: Album; size?: "md" | "lg" }) {
  const { album: current, select } = useNowPlaying();
  const active = current.slug === album.slug;
  const dimension = size === "lg" ? "h-14 w-14" : "h-11 w-11";

  return (
    <motion.button
      type="button"
      onClick={() => select(album.slug)}
      whileTap={{ scale: 0.92 }}
      aria-pressed={active}
      aria-label={active ? `${album.title} is in Now Playing` : `Show ${album.title} in Now Playing`}
      title={active ? "In Now Playing" : "Show in Now Playing"}
      className={`relative z-20 grid ${dimension} shrink-0 place-items-center rounded-full shadow-lg shadow-black/40 transition-colors ${
        active ? "bg-paper text-ink-950" : "bg-signal text-ink-950 hover:bg-signal-soft"
      }`}
    >
      {active ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" aria-hidden="true">
          <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
        </svg>
      )}
    </motion.button>
  );
}
