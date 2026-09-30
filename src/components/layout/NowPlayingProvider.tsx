"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { albums, flagship } from "@/data/albums";
import type { Album } from "@/types/album";

interface NowPlayingContextValue {
  album: Album;
  index: number;
  select: (slug: string) => void;
  next: () => void;
  previous: () => void;
}

const NowPlayingContext = createContext<NowPlayingContextValue | null>(null);

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState(flagship.slug);

  const index = Math.max(
    0,
    albums.findIndex((album) => album.slug === slug),
  );

  const select = useCallback((next: string) => setSlug(next), []);
  const step = useCallback(
    (delta: number) =>
      setSlug((current) => {
        const i = albums.findIndex((album) => album.slug === current);
        return albums[(i + delta + albums.length) % albums.length].slug;
      }),
    [],
  );
  const next = useCallback(() => step(1), [step]);
  const previous = useCallback(() => step(-1), [step]);

  const value = useMemo(
    () => ({ album: albums[index], index, select, next, previous }),
    [index, select, next, previous],
  );

  return <NowPlayingContext value={value}>{children}</NowPlayingContext>;
}

export function useNowPlaying() {
  const context = useContext(NowPlayingContext);
  if (!context) throw new Error("useNowPlaying must be used inside <NowPlayingProvider>");
  return context;
}
