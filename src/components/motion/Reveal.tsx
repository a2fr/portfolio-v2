"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Reveal once the element scrolls into view instead of on mount. */
  inView?: boolean;
  as?: "div" | "section" | "li" | "header";
  "aria-labelledby"?: string;
}

/** Section entrance: a short fade + rise. */
export function Reveal({
  children,
  className,
  delay = 0,
  inView = false,
  as = "div",
  "aria-labelledby": labelledBy,
}: RevealProps) {
  const Component = motion[as];
  const target = { opacity: 1, y: 0 };
  return (
    <Component
      className={className}
      aria-labelledby={labelledBy}
      initial={{ opacity: 0, y: 18 }}
      {...(inView
        ? { whileInView: target, viewport: { once: true, margin: "0px 0px -10% 0px" } }
        : { animate: target })}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </Component>
  );
}
