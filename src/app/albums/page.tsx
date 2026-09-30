import type { Metadata } from "next";
import { LibraryGrid } from "@/components/albums/LibraryGrid";
import { albums } from "@/data/albums";

export const metadata: Metadata = {
  title: "Library",
  description: "Every release in the discography: flagship product, professional eras and side projects.",
};

export default function LibraryPage() {
  return (
    <div className="px-4 pt-8 sm:px-8 sm:pt-12">
      <p className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">Your library</p>
      <h1 className="mt-2 font-display text-6xl leading-none sm:text-7xl">Discography</h1>
      <p className="mt-3 mb-10 max-w-xl text-muted">
        {albums.length} releases — a flagship product, professional eras and B-sides. Filter by format, or open a
        release to read its tracklist.
      </p>
      <LibraryGrid />
    </div>
  );
}
