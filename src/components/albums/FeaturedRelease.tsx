"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { albumKindLabel } from "@/data/albums";
import type { Album } from "@/types/album";
import { ArrowUpRightIcon } from "@/components/layout/icons";
import { AlbumCover } from "./AlbumCover";
import { TagList } from "./AlbumCard";
import { PreviewButton } from "./PreviewButton";

/** The flagship release — a large, immersive feature. */
export function FeaturedRelease({ album }: { album: Album }) {
  const href = `/albums/${album.slug}`;

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      aria-labelledby="featured-title"
      className="grain relative overflow-hidden rounded-3xl border border-ink-700/60"
    >
      {/* Ambient wash taken from the cover itself */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 scale-125 opacity-45 blur-3xl" style={{ background: album.cover.background }} />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/70 to-ink-950/40" />
      </div>

      <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:gap-10 lg:p-10">
        <motion.div
          variants={{ rest: { rotate: 0, y: 0 }, hover: { rotate: -1.5, y: -6 } }}
          transition={{ type: "spring", damping: 20, stiffness: 180 }}
          className="relative mx-auto w-full max-w-sm md:max-w-none"
        >
          {/* A record peeking out of the sleeve */}
          <motion.div
            aria-hidden="true"
            variants={{ rest: { x: "0%" }, hover: { x: "14%" } }}
            transition={{ type: "spring", damping: 22, stiffness: 160 }}
            className="absolute inset-[4%] rounded-full bg-[repeating-radial-gradient(circle,#161412_0_2px,#0b0a09_2px_4px)] shadow-2xl"
          >
            <div className="absolute inset-[34%] rounded-full" style={{ background: album.cover.background }} />
            <div className="absolute inset-[48%] rounded-full bg-ink-950" />
          </motion.div>
          <AlbumCover album={album} className="relative rounded-2xl shadow-2xl shadow-black/60" sizes="(min-width: 768px) 40vw, 90vw" />
        </motion.div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] tracking-[0.18em] text-signal-soft uppercase">
            <span className="rounded-full bg-signal px-2 py-0.5 text-ink-950">{albumKindLabel[album.kind]}</span>
            <span className="text-muted">
              {album.catalog} {album.period && `· ${album.period}`}
            </span>
          </p>
          <h3 id="featured-title" className="mt-3 font-display text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
            <Link href={href} className="rounded-md hover:text-signal-soft">
              {album.title}
            </Link>
          </h3>
          {album.role && <p className="mt-3 text-base text-paper">{album.role}</p>}
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{album.summary}</p>

          <TagList tags={album.stack} className="mt-5" />

          <ol className="mt-6 grid gap-x-6 sm:grid-cols-2" aria-label={`${album.title} tracklist`}>
            {album.tracks.map((track, i) => (
              <li key={track.title} className="flex items-baseline gap-3 border-b border-paper/10 py-2 text-sm">
                <span className="w-5 font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-paper/90">{track.title}</span>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <PreviewButton album={album} size="lg" />
            <Link
              href={href}
              className="rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-signal-soft"
            >
              Open the release
            </Link>
            {album.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-paper/25 px-4 py-3 text-sm text-paper transition-colors hover:border-paper/60"
              >
                {link.label}
                <ArrowUpRightIcon className="h-4 w-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
