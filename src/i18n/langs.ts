/** Languages the site is written in. Shared by the server (first render) and the browser. */
export const LANGS = ["fil", "en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

/** A piece of copy written in every language. */
export type Localized = Record<Lang, string>;

/** BCP 47 tag for formatting dates. */
export const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-GB", fil: "fil-PH" };

/** Cookie holding the language the visitor picked with a flag, so the server renders the page in it. */
export const LANG_COOKIE = "lang";

export const isLang = (value: unknown): value is Lang => (LANGS as readonly unknown[]).includes(value);

/** The site's language for a language tag ("fr-CA", "tl", "en-US"...), if it has one. */
export function fromTag(tag: string): Lang | null {
  const base = tag.trim().toLowerCase().split("-")[0];
  if (base === "fr") return "fr";
  if (base === "fil" || base === "tl") return "fil"; // Tagalog is the base of Filipino
  if (base === "en") return "en";
  return null;
}

/** The first of the visitor's preferred languages, most preferred first, that the site has; English otherwise. */
export function pickLanguage(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const lang = fromTag(tag);
    if (lang) return lang;
  }
  return "en";
}
