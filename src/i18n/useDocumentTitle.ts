"use client";

import { useEffect } from "react";

/**
 * Keeps the tab title in the site's language. Next writes the English title from the page metadata, sometimes
 * after hydration (streamed metadata), so the title is put back whenever something else rewrites it.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
}
