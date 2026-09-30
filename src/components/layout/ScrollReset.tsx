"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** On large screens the content column scrolls on its own; reset it on navigation. */
export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    document.getElementById("scroll-root")?.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
