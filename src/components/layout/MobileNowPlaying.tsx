"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { albumKindLabel } from "@/data/albums";
import { AlbumCover } from "@/components/albums/AlbumCover";
import { Equalizer } from "@/components/albums/Equalizer";
import { useNowPlaying } from "./NowPlayingProvider";
import { NowPlayingContent } from "./NowPlayingContent";
import { ChevronDownIcon, NextIcon } from "./icons";

/**
 * Below xl: a mini-player docked above the tab bar that expands into a
 * bottom sheet with the full Now Playing view.
 */
export function MobileNowPlaying() {
  const { album, next } = useNowPlaying();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-2 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 lg:bottom-3 lg:left-auto lg:w-96 xl:hidden">
        <div className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800/95 p-2 pr-3 shadow-2xl shadow-black/60 backdrop-blur">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={album.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="w-11 shrink-0"
              >
                <AlbumCover album={album} bare className="rounded-md" sizes="44px" />
              </motion.div>
            </AnimatePresence>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-signal uppercase">
                <Equalizer /> Now Playing · {albumKindLabel[album.kind]}
              </span>
              <span className="block truncate text-sm font-medium">{album.title}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next release"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-ink-700 hover:text-paper"
          >
            <NextIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <motion.div
              className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-heading"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="scrollbar-thin absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t border-ink-700 bg-ink-900 px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:mx-auto sm:max-w-md"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-600" aria-hidden="true" />
              <div className="mb-4 flex items-center justify-between">
                <h2 id="sheet-heading" className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
                  Now Playing
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close Now Playing"
                  className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-muted hover:text-paper"
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mx-auto max-w-sm">
                <NowPlayingContent onNavigate={() => setOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
