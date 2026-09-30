"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useId } from "react";
import { albumKindLabel, albums } from "@/data/albums";
import { AlbumCover } from "@/components/albums/AlbumCover";
import { useNowPlaying } from "./NowPlayingProvider";
import { NextIcon, PrevIcon } from "./icons";

/** Body of the Now Playing surface — shared by the desktop panel and the mobile sheet. */
export function NowPlayingContent({ onNavigate }: { onNavigate?: () => void }) {
  const { album, index, next, previous } = useNowPlaying();
  const id = useId();

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={album.slug}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-5"
        >
          <AlbumCover album={album} className="rounded-xl shadow-2xl shadow-black/60" sizes="320px" />

          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
              <span className="text-signal-soft">{albumKindLabel[album.kind]}</span>
              {album.period && <> · {album.period}</>}
            </p>
            <h2 className="mt-1 font-display text-3xl leading-tight">{album.title}</h2>
            {album.role && <p className="mt-1 text-sm text-paper/90">{album.role}</p>}
            <p className="mt-1 text-sm text-muted">{album.subtitle}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={previous}
          className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink-700 hover:text-paper"
          aria-label="Previous release"
        >
          <PrevIcon className="h-5 w-5" />
        </button>
        <Link
          href={`/albums/${album.slug}`}
          onClick={onNavigate}
          className="flex-1 rounded-full bg-paper px-4 py-2.5 text-center text-sm font-medium text-ink-950 transition-colors hover:bg-signal-soft"
        >
          Open release
        </Link>
        <button
          type="button"
          onClick={next}
          className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-ink-700 hover:text-paper"
          aria-label="Next release"
        >
          <NextIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Position in the library, rendered as a progress rail. */}
      <div>
        <div className="flex gap-1" aria-hidden="true">
          {albums.map((a, i) => (
            <span
              key={a.slug}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= index ? "bg-signal" : "bg-ink-700"}`}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[11px] text-faint">
          {String(index + 1).padStart(2, "0")} / {String(albums.length).padStart(2, "0")} in the library
        </p>
      </div>

      <section aria-labelledby={`${id}-tracks`}>
        <h3 id={`${id}-tracks`} className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
          Tracklist
        </h3>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ol
            key={album.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 flex flex-col"
          >
            {album.tracks.map((track, i) => (
              <li key={track.title} className="flex gap-3 border-b border-ink-700/60 py-2 text-sm last:border-0">
                <span className="w-5 font-mono text-xs leading-5 text-faint">{i + 1}</span>
                <span className="text-paper/90">{track.title}</span>
              </li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </section>

      <section aria-labelledby={`${id}-stack`}>
        <h3 id={`${id}-stack`} className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
          Instruments
        </h3>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {album.stack.map((tech) => (
            <li key={tech} className="rounded-md bg-ink-700/70 px-2 py-1 text-xs text-paper/90">
              {tech}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
