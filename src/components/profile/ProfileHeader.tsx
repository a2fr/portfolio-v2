"use client";

import { motion } from "framer-motion";
import { profile } from "@/data/profile";
import { easeOut } from "@/components/motion/Reveal";

export function ProfileHeader() {
  return (
    <header className="grain relative overflow-hidden px-4 pt-10 pb-12 sm:px-8 sm:pt-16">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(236,106,51,0.35),transparent_55%),radial-gradient(ellipse_at_100%_100%,rgba(127,176,240,0.10),transparent_50%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink-900" />
      </div>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: easeOut }}
          aria-hidden="true"
          className="relative grid h-44 w-44 shrink-0 place-items-center rounded-full bg-[repeating-radial-gradient(circle,#1a1816_0_2px,#0e0d0c_2px_4px)] shadow-2xl shadow-black/70 sm:h-56 sm:w-56"
        >
          <span className="grid h-[42%] w-[42%] place-items-center rounded-full bg-signal font-display text-4xl text-ink-950 sm:text-5xl">
            {profile.initials}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: easeOut }}
        >
          <p className="font-mono text-[11px] tracking-[0.18em] text-signal-soft uppercase">Artist</p>
          <h1 className="mt-2 font-display text-[clamp(3.5rem,10vw,7.5rem)] leading-[0.88]">{profile.name}</h1>
          <p className="mt-3 text-lg text-paper">
            {profile.title} — <em className="font-display text-[1.15em] text-signal-soft">{profile.specialty}</em>
          </p>
          <p className="mt-1 text-sm text-muted">{profile.status}</p>
        </motion.div>
      </div>
    </header>
  );
}
