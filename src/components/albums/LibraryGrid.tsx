"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { albumKindLabel, albums } from "@/data/albums";
import type { AlbumKind } from "@/types/album";
import { AlbumCard } from "./AlbumCard";

const filters: { value: AlbumKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "main-release", label: albumKindLabel["main-release"] },
  { value: "era", label: "Eras" },
  { value: "ep", label: "EPs" },
  { value: "b-side", label: "B-Sides" },
];

export function LibraryGrid() {
  const [filter, setFilter] = useState<AlbumKind | "all">("all");
  const visible = filter === "all" ? albums : albums.filter((album) => album.kind === filter);

  return (
    <>
      <div role="group" aria-label="Filter by format" className="mb-8 flex flex-wrap gap-2">
        {filters.map(({ value, label }) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(value)}
              className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                active ? "text-ink-950" : "bg-ink-800 text-muted hover:text-paper"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="library-filter"
                  className="absolute inset-0 rounded-full bg-paper"
                  transition={{ type: "spring", damping: 30, stiffness: 380 }}
                />
              )}
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      <motion.ul layout className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((album) => (
            <motion.li
              key={album.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              <AlbumCard album={album} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <p className="sr-only" aria-live="polite">
        {visible.length} releases shown
      </p>
    </>
  );
}
