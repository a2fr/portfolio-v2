"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/** Honors the user's reduced-motion preference for every Framer Motion animation. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
