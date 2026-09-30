"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { albumKindLabel, albums } from "@/data/albums";
import { AlbumCover } from "@/components/albums/AlbumCover";
import { SearchIcon } from "./icons";

function matches(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return albums.filter((album) =>
    [album.title, album.subtitle, album.role ?? "", ...album.stack, ...album.tags]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

/** Library search: filters releases by title, role, technology or theme. */
export function SearchBox() {
  const router = useRouter();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => matches(query), [query]);
  const showList = open && query.trim().length > 0;

  // "/" focuses search, like most media libraries.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(target.tagName)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/albums/${slug}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && showList && results[active]) {
      event.preventDefault();
      go(results[active].slug);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor={`${id}-input`} className="sr-only">
        Search the discography
      </label>
      <div className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800/80 px-4 transition-colors focus-within:border-ink-600 focus-within:bg-ink-800 hover:border-ink-600">
        <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          placeholder="Search releases, stacks, genres…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="h-10 w-full bg-transparent text-sm text-paper placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd className="hidden rounded border border-ink-600 px-1.5 font-mono text-[10px] text-faint sm:block">/</kbd>
      </div>

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={`${id}-list`}
            role="listbox"
            aria-label="Search results"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-12 z-40 overflow-hidden rounded-2xl border border-ink-700 bg-ink-850 p-1.5 shadow-2xl shadow-black/70"
          >
            {results.length === 0 && (
              <li className="px-3 py-3 text-sm text-muted" role="option" aria-selected="false" aria-disabled="true">
                No releases match “{query.trim()}”.
              </li>
            )}
            {results.map((album, i) => (
              <li
                key={album.slug}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(album.slug)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 ${i === active ? "bg-ink-700/70" : ""}`}
              >
                <AlbumCover album={album} bare className="w-9 shrink-0 rounded" sizes="36px" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{album.title}</span>
                  <span className="block truncate text-xs text-faint">
                    {albumKindLabel[album.kind]} · {album.subtitle}
                  </span>
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
