"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { albums, getAlbumsByKind } from "@/data/albums";
import { profile } from "@/data/profile";
import { easeOut } from "@/components/motion/Reveal";

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.08 * i, ease: easeOut } }),
};

export function Hero() {
  const eras = getAlbumsByKind("era").length;

  return (
    <section
      aria-labelledby="hero-title"
      className="grain relative overflow-hidden px-4 pt-10 pb-12 sm:px-8 sm:pt-16 lg:pb-16"
    >
      {/* Warm stage light + a slowly turning record */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_10%,rgba(236,106,51,0.38),transparent_55%),radial-gradient(ellipse_at_10%_100%,rgba(244,182,70,0.10),transparent_50%)]" />
        <div className="absolute -top-56 -right-60 h-[28rem] w-[28rem] rounded-full bg-[repeating-radial-gradient(circle,rgba(243,238,230,0.07)_0_1px,transparent_1px_6px)] opacity-70 motion-safe:animate-[spin_60s_linear_infinite] sm:-top-32 sm:-right-64 sm:h-[36rem] sm:w-[36rem] sm:opacity-80">
          <div className="absolute inset-[38%] rounded-full bg-signal/80" />
          <div className="absolute inset-[48.5%] rounded-full bg-ink-900" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />
      </div>

      <motion.p
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0}
        className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-signal-soft uppercase"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
        Artist profile · {profile.title}
      </motion.p>

      <motion.h1
        id="hero-title"
        variants={rise}
        initial="hidden"
        animate="show"
        custom={1}
        className="mt-4 font-display text-[clamp(3.75rem,13vw,9.5rem)] leading-[0.86] tracking-[-0.02em]"
      >
        {profile.name}
      </motion.h1>

      <motion.p
        variants={rise}
        initial="hidden"
        animate="show"
        custom={2}
        className="mt-5 max-w-2xl text-xl leading-snug text-paper sm:text-2xl"
      >
        {profile.title} <span className="text-faint">—</span>{" "}
        <em className="font-display text-[1.15em] text-signal-soft">{profile.specialty}</em>
      </motion.p>

      <motion.p
        variants={rise}
        initial="hidden"
        animate="show"
        custom={3}
        className="mt-3 max-w-xl text-base text-muted"
      >
        I build complete products, from the database to the interface. This is my discography: a flagship
        product live with a real restaurant, professional eras and B-sides.
        <span className="mt-2 block text-paper">{profile.status}.</span>
      </motion.p>

      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={4}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <Link
          href="#discography"
          className="inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-signal-soft"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
          </svg>
          Explore the discography
        </Link>
        <Link
          href="/about"
          className="rounded-full border border-ink-600 px-5 py-3 text-sm text-paper transition-colors hover:border-paper/60"
        >
          Artist profile
        </Link>
      </motion.div>

      <motion.dl
        variants={rise}
        initial="hidden"
        animate="show"
        custom={5}
        className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm"
      >
        {[
          { value: albums.length, label: "releases" },
          { value: eras, label: "professional eras" },
          { value: 1, label: "product live in pilot" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2">
            <dt className="order-2 text-muted">{stat.label}</dt>
            <dd className="order-1 font-display text-3xl text-paper">{stat.value}</dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
