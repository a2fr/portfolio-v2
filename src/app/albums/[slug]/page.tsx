import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumCard, TagList } from "@/components/albums/AlbumCard";
import { AlbumHeader } from "@/components/albums/AlbumHeader";
import { SetNowPlaying } from "@/components/albums/SetNowPlaying";
import { Tracklist } from "@/components/albums/Tracklist";
import { ArrowUpRightIcon } from "@/components/layout/icons";
import { Reveal } from "@/components/motion/Reveal";
import { albumKindDescription, albums, getAlbum } from "@/data/albums";

export const dynamicParams = false;

export function generateStaticParams() {
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: PageProps<"/albums/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) return {};
  return { title: album.title, description: album.summary };
}

export default async function AlbumPage({ params }: PageProps<"/albums/[slug]">) {
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) notFound();

  const index = albums.indexOf(album);
  const more = [1, 2, 3].map((offset) => albums[(index + offset) % albums.length]);

  return (
    <article>
      <SetNowPlaying slug={album.slug} />
      <AlbumHeader album={album} />

      <div className="grid gap-12 px-4 sm:px-8 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <Reveal as="section" inView aria-labelledby="liner-notes">
            <h2 id="liner-notes" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Liner notes
            </h2>
            <p className="mt-3 max-w-2xl font-display text-2xl leading-snug text-paper sm:text-3xl">{album.summary}</p>
          </Reveal>

          <section aria-labelledby="tracklist" className="mt-12">
            <h2 id="tracklist" className="mb-2 font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Tracklist
            </h2>
            <Tracklist tracks={album.tracks} labelledBy="tracklist" />
          </section>
        </div>

        <Reveal as="div" inView className="flex flex-col gap-8 xl:pt-1">
          <section aria-labelledby="credits">
            <h2 id="credits" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Credits
            </h2>
            <dl className="mt-3 flex flex-col gap-3 text-sm">
              {album.role && <Credit term="Role" value={album.role} />}
              {album.period && <Credit term="Period" value={album.period} />}
              <Credit term="Format" value={albumKindDescription[album.kind]} />
              <Credit term="Catalogue" value={album.catalog} />
            </dl>
          </section>

          <section aria-labelledby="instruments">
            <h2 id="instruments" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Instruments · Technologies
            </h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {album.stack.map((tech) => (
                <li key={tech} className="rounded-md bg-ink-700/70 px-2.5 py-1 text-sm text-paper/90">
                  {tech}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="genres">
            <h2 id="genres" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
              Genres
            </h2>
            <TagList tags={album.tags} className="mt-3" />
          </section>

          {album.links.length > 0 && (
            <section aria-labelledby="links">
              <h2 id="links" className="font-mono text-[11px] tracking-[0.18em] text-faint uppercase">
                Links
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {album.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 rounded-xl border border-ink-700 p-3 transition-colors hover:border-ink-600 hover:bg-ink-800"
                    >
                      <span>
                        <span className="block text-sm text-paper">{link.label}</span>
                        {link.description && <span className="block text-xs text-muted">{link.description}</span>}
                      </span>
                      <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-muted group-hover:text-signal" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Reveal>
      </div>

      <section aria-labelledby="more" className="mt-20 px-4 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 id="more" className="font-display text-3xl sm:text-4xl">
            More from the discography
          </h2>
          <Link href="/albums" className="shrink-0 text-sm text-muted underline-offset-4 hover:text-paper hover:underline">
            Full library
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
          {more.map((item, i) => (
            <li key={item.slug} className={i === 2 ? "hidden md:block" : undefined}>
              <AlbumCard album={item} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function Credit({ term, value }: { term: string; value: string }) {
  return (
    <div className="border-b border-ink-700/70 pb-3">
      <dt className="text-xs text-faint">{term}</dt>
      <dd className="mt-0.5 text-paper">{value}</dd>
    </div>
  );
}
