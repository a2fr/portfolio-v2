import type { Localized } from "@/i18n/language";

/**
 * A piece of copy. `draft` marks a placeholder that still needs real content:
 * the site renders it as a dashed "To write" block so nothing invented is
 * mistaken for a fact. Text is either one string for every language, or written per language.
 */
export interface Note {
  text: string | Localized;
  draft?: boolean;
}

export const fact = (text: string | Localized): Note => ({ text });
export const todo = (text: string): Note => ({ text, draft: true });
