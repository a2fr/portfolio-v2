"use client";

import { useLanguage } from "./language";
import { strings } from "./strings";

/** Interface copy in the site's current language. */
export function useT() {
  return strings[useLanguage()];
}
