"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { albumKindLabel, albums } from "@/data/albums";
import { profile } from "@/data/profile";
import { AlbumCover } from "@/components/albums/AlbumCover";
import { Equalizer } from "@/components/albums/Equalizer";
import { useNowPlaying } from "./NowPlayingProvider";
import { navItems } from "./navigation";

export function Sidebar() {
  const pathname = usePathname();
  const { album: playing } = useNowPlaying();

  return (
    <aside className="hidden min-h-0 flex-col gap-2 lg:flex" aria-label="Sidebar">
      <div className="rounded-2xl bg-ink-900 p-4">
        <Link href="/" className="flex items-center gap-3 rounded-lg">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-signal font-display text-xl text-ink-950">
            {profile.initials}
          </span>
          <span className="leading-tight">
            <span className="block font-medium">{profile.name}</span>
            <span className="block text-xs text-muted">{profile.title}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="mt-5">
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active ? "text-paper" : "text-muted hover:text-paper"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-lg bg-ink-700/70"
                        transition={{ type: "spring", damping: 30, stiffness: 380 }}
                      />
                    )}
                    <Icon className="relative h-5 w-5" />
                    <span className="relative">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl bg-ink-900 p-3">
        <h2 className="px-2 pt-1 pb-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          Discography
        </h2>
        <ul className="flex flex-col gap-0.5">
          {albums.map((album) => {
            const href = `/albums/${album.slug}`;
            const active = pathname === href;
            const isPlaying = playing.slug === album.slug;
            return (
              <li key={album.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                    active ? "bg-ink-700/70" : "hover:bg-ink-800"
                  }`}
                >
                  <AlbumCover album={album} bare className="w-11 shrink-0 rounded-md" sizes="44px" />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${isPlaying ? "text-signal" : "text-paper"}`}>
                      {album.title}
                    </span>
                    <span className="block truncate text-xs text-faint">
                      {albumKindLabel[album.kind]}
                      {album.year ? ` · ${album.year}` : ""}
                    </span>
                  </span>
                  {isPlaying && (
                    <>
                      <Equalizer className="text-signal" />
                      <span className="sr-only">(Now playing)</span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex gap-2 px-2 pt-4 pb-1">
          {profile.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink-700 px-3 py-1 text-xs text-muted transition-colors hover:border-ink-600 hover:text-paper"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
