"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { albumKindLabel } from "@/data/albums";
import type { Album } from "@/types/album";
import { useNowPlaying } from "@/components/layout/NowPlayingProvider";
import { AlbumCover } from "./AlbumCover";
import { Equalizer } from "./Equalizer";
import { PreviewButton } from "./PreviewButton";

interface AlbumCardProps {
  album: Album;
  /** "tile" — square record sleeve; "era" — wide row for professional eras. */
  layout?: "tile" | "era";
}

const coverMotion = {
  rest: { y: 0, rotate: 0, scale: 1 },
  hover: { y: -6, rotate: -1.2, scale: 1.015 },
};

export function AlbumCard({ album, layout = "tile" }: AlbumCardProps) {
  const { album: current } = useNowPlaying();
  const isPlaying = current.slug === album.slug;
  const href = `/albums/${album.slug}`;

  if (layout === "era") {
    return (
      <motion.article
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="group relative grid grid-cols-[88px_1fr] items-center gap-4 rounded-2xl border border-ink-700/70 bg-ink-850/60 p-3 transition-colors hover:border-ink-600 hover:bg-ink-800 focus-within:border-ink-600 sm:grid-cols-[132px_1fr_auto] sm:gap-6 sm:p-4"
      >
        <motion.div variants={coverMotion} className="shadow-xl shadow-black/40">
          <AlbumCover album={album} bare className="rounded-lg" />
        </motion.div>

        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
            <span className="text-signal-soft">{albumKindLabel[album.kind]}</span>
            {album.period && <span>· {album.period}</span>}
            {isPlaying && (
              <span className="inline-flex items-center gap-1.5 text-signal">
                · <Equalizer /> <span className="sr-only">Now playing</span>
              </span>
            )}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">
            <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-signal">
              {album.title}
            </Link>
          </h3>
          {album.role && <p className="mt-0.5 text-sm text-paper/90">{album.role}</p>}
          <p className="mt-1 text-sm text-muted">{album.subtitle}</p>
          <TagList tags={album.tags} className="mt-3 hidden sm:flex" />
        </div>

        <div className="relative z-10 col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
          <TagList tags={album.tags.slice(0, 3)} className="sm:hidden" />
          <PreviewButton album={album} />
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article initial="rest" whileHover="hover" animate="rest" className="group relative">
      <div className="relative">
        <motion.div variants={coverMotion} className="shadow-2xl shadow-black/50">
          <AlbumCover album={album} className="rounded-xl" />
        </motion.div>
        {/* Sits outside the transformed cover so it stays above the card's stretched link. */}
        <div className="absolute right-3 bottom-3 z-20 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
          <PreviewButton album={album} />
        </div>
      </div>

      <div className="mt-4 px-0.5">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
          <span className="text-signal-soft">{albumKindLabel[album.kind]}</span>
          {album.year && <span>· {album.year}</span>}
          {isPlaying && (
            <span className="inline-flex items-center gap-1.5 text-signal">
              · <Equalizer /> <span className="sr-only">Now playing</span>
            </span>
          )}
        </p>
        <h3 className="mt-1 font-display text-2xl leading-tight">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-signal">
            {album.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{album.subtitle}</p>
        <TagList tags={album.tags.slice(0, 3)} className="mt-3" />
      </div>
    </motion.article>
  );
}

export function TagList({ tags, className = "" }: { tags: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Tags">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-ink-600/80 px-2.5 py-0.5 text-[11px] text-muted"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
