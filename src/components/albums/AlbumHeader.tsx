"use client";

import { motion } from "framer-motion";
import { albumKindDescription, albumKindLabel } from "@/data/albums";
import type { Album } from "@/types/album";
import { easeOut } from "@/components/motion/Reveal";
import { AlbumCover } from "./AlbumCover";
import { PreviewButton } from "./PreviewButton";
import { ArrowUpRightIcon } from "@/components/layout/icons";

export function AlbumHeader({ album }: { album: Album }) {
  return (
    <header className="grain relative overflow-hidden px-4 pt-8 pb-10 sm:px-8 sm:pt-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-50 blur-3xl" style={{ background: album.cover.background }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/30 via-ink-900/70 to-ink-900" />
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:items-end">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="w-56 shrink-0 self-center sm:w-64 md:self-auto lg:w-72"
        >
          <AlbumCover album={album} className="rounded-2xl shadow-2xl shadow-black/70" sizes="288px" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
          className="min-w-0"
        >
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-[0.18em] text-signal-soft uppercase">
            <span>{albumKindLabel[album.kind]}</span>
            <span className="text-faint">· {albumKindDescription[album.kind]}</span>
            <span className="text-faint">· {album.catalog}</span>
          </p>
          <h1 className="mt-3 font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.9] tracking-[-0.01em]">
            {album.title}
          </h1>
          <p className="mt-3 text-lg text-paper/90">{album.subtitle}</p>
          <p className="mt-2 flex flex-wrap gap-x-3 text-sm text-muted">
            {album.role && <span className="text-paper">{album.role}</span>}
            {album.period && <span>{album.period}</span>}
            <span>
              {album.tracks.length} tracks
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PreviewButton album={album} size="lg" />
            {album.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-signal-soft"
              >
                {link.label}
                <ArrowUpRightIcon className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
