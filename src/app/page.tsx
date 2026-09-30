import Link from "next/link";
import { AlbumCard } from "@/components/albums/AlbumCard";
import { FeaturedRelease } from "@/components/albums/FeaturedRelease";
import { SectionHeading } from "@/components/albums/SectionHeading";
import { Hero } from "@/components/hero/Hero";
import { Reveal } from "@/components/motion/Reveal";
import { flagship, getAlbumsByKind } from "@/data/albums";

export default function Home() {
  const professional = getAlbumsByKind("era", "ep");
  const sideProjects = getAlbumsByKind("b-side");

  return (
    <>
      <Hero />

      <div id="discography" className="flex scroll-mt-20 flex-col gap-16 px-4 sm:px-8 lg:gap-20">
        <Reveal as="section" inView aria-labelledby="main-release">
          <SectionHeading id="main-release" eyebrow="Side A · Flagship" title="Main Release" />
          <FeaturedRelease album={flagship} />
        </Reveal>

        <Reveal as="section" inView aria-labelledby="eras">
          <SectionHeading id="eras" eyebrow="Professional experience" title="Eras">
            <p className="max-w-xs text-sm text-muted">Industry chapters — each one a different sound.</p>
          </SectionHeading>
          <ul className="flex flex-col gap-3">
            {professional.map((album, i) => (
              <Reveal as="li" inView delay={i * 0.06} key={album.slug}>
                <AlbumCard album={album} layout="era" />
              </Reveal>
            ))}
          </ul>
        </Reveal>

        <Reveal as="section" inView aria-labelledby="b-sides">
          <SectionHeading id="b-sides" eyebrow="Side projects & experiments" title="B-Sides">
            <Link href="/albums" className="text-sm text-muted underline-offset-4 hover:text-paper hover:underline">
              Browse the full library
            </Link>
          </SectionHeading>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
            {sideProjects.map((album, i) => (
              <Reveal as="li" inView delay={i * 0.08} key={album.slug}>
                <AlbumCard album={album} />
              </Reveal>
            ))}
          </ul>
        </Reveal>
      </div>
    </>
  );
}
