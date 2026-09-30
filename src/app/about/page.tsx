import type { Metadata } from "next";
import Link from "next/link";
import { AlbumCover } from "@/components/albums/AlbumCover";
import { ArrowUpRightIcon } from "@/components/layout/icons";
import { Reveal } from "@/components/motion/Reveal";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { albumKindLabel, albums } from "@/data/albums";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.name} — ${profile.title}, ${profile.specialty}.`,
};

const linkedIn = profile.links.find((link) => link.label === "LinkedIn");

export default function AboutPage() {
  return (
    <>
      <ProfileHeader />

      <div className="grid gap-14 px-4 sm:px-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-14">
          <Reveal as="section" inView aria-labelledby="bio">
            <h2 id="bio" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              About the artist
            </h2>
            <div className="mt-3 flex max-w-2xl flex-col gap-4">
              {profile.bio.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "font-display text-2xl leading-snug sm:text-3xl" : "text-muted"}>
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal as="section" inView aria-labelledby="genres">
            <h2 id="genres" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Genres & instruments
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {profile.genres.map((genre) => (
                <li key={genre.name} className="rounded-2xl border border-ink-700/70 bg-ink-850/60 p-4">
                  <h3 className="font-display text-2xl">{genre.name}</h3>
                  <p className="mt-2 text-sm text-muted">{genre.instruments.join(" · ")}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section" inView aria-labelledby="influences">
            <h2 id="influences" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Influences
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.influences.map((influence) => (
                <li key={influence} className="rounded-full border border-ink-600 px-3.5 py-1.5 text-sm text-paper/90">
                  {influence}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section" inView aria-labelledby="discography">
            <h2 id="discography" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Discography
            </h2>
            <ol className="mt-3">
              {albums.map((album, i) => (
                <li key={album.slug}>
                  <Link
                    href={`/albums/${album.slug}`}
                    className="grid grid-cols-[1.75rem_2.75rem_1fr] items-center gap-3 rounded-lg p-2 transition-colors hover:bg-ink-800 sm:grid-cols-[1.75rem_2.75rem_1fr_auto]"
                  >
                    <span className="font-mono text-xs text-faint">{i + 1}</span>
                    <AlbumCover album={album} bare className="rounded" sizes="44px" />
                    <span className="min-w-0">
                      <span className="block truncate">{album.title}</span>
                      <span className="block truncate text-xs text-faint">{album.role ?? album.subtitle}</span>
                    </span>
                    <span className="hidden font-mono text-xs text-faint sm:block">
                      {albumKindLabel[album.kind]}
                      {album.year && ` · ${album.year}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal as="div" inView className="flex flex-col gap-8">
          <section aria-labelledby="elsewhere">
            <h2 id="elsewhere" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Elsewhere
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {profile.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-ink-700 p-3 transition-colors hover:border-ink-600 hover:bg-ink-800"
                  >
                    <span>
                      <span className="block text-sm">{link.label}</span>
                      <span className="block text-xs text-muted">{link.handle}</span>
                    </span>
                    <ArrowUpRightIcon className="h-4 w-4 text-muted group-hover:text-signal" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="resume">
            <h2 id="resume" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Resume
            </h2>
            {profile.resumeUrl ? (
              <a href={profile.resumeUrl} className="mt-3 block rounded-xl border border-ink-700 p-3 text-sm hover:bg-ink-800">
                Download resume
              </a>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-ink-600 p-3 text-sm text-muted">
                Resume coming soon.
              </p>
            )}
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Contact
            </h2>
            {profile.email ? (
              <a href={`mailto:${profile.email}`} className="mt-3 block text-sm text-paper underline underline-offset-4">
                {profile.email}
              </a>
            ) : (
              <p className="mt-3 text-sm text-muted">
                A dedicated contact channel is coming soon. In the meantime, you can reach me{" "}
                {linkedIn && (
                  <a
                    href={linkedIn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-paper underline underline-offset-4 hover:text-signal-soft"
                  >
                    on LinkedIn
                  </a>
                )}
                .
              </p>
            )}
          </section>
        </Reveal>
      </div>
    </>
  );
}
