"use client";

import { useEffect } from "react";
import { useNowPlaying } from "@/components/layout/NowPlayingProvider";

/** Opening a release loads it into Now Playing. */
export function SetNowPlaying({ slug }: { slug: string }) {
  const { select } = useNowPlaying();
  useEffect(() => select(slug), [select, slug]);
  return null;
}
