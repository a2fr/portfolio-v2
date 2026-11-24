"use client";

import { type Strings } from "./strings";
import { useT } from "./useT";

type Key = { [K in keyof Strings]: Strings[K] extends string ? K : never }[keyof Strings];

/** One piece of interface copy in the site's language, for server-rendered pages. */
export function Say({ k }: { k: Key }) {
  return useT()[k];
}
