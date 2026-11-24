"use client";

import { createContext, createElement, type ReactNode, useContext, useSyncExternalStore } from "react";
import { LANG_COOKIE, type Lang, isLang, pickLanguage } from "./langs";

export { LANGS, LOCALE, type Lang, type Localized } from "./langs";

const listeners = new Set<() => void>();
let current: Lang | null = null;

/** Remembers the choice in a cookie for a year, so the server renders the next visit in it straight away. */
function remember(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * The site's language in the browser. It starts as the language the server rendered the page in (`<html lang>`),
 * so hydration matches and nothing flashes; the browser's own preferences are only a fallback.
 */
export function getLanguage(): Lang {
  if (typeof window === "undefined") return "en";
  if (!current) {
    const rendered = document.documentElement.lang;
    current = isLang(rendered) ? rendered : pickLanguage(navigator.languages ?? [navigator.language]);
  }
  return current;
}

export function setLanguage(lang: Lang) {
  if (lang === getLanguage()) return;
  current = lang;
  document.documentElement.lang = lang;
  remember(lang);
  listeners.forEach((notify) => notify());
}

export function subscribeLanguage(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

/** The language the server picked for this request; the first render on both sides uses it. */
const RenderedLanguage = createContext<Lang>("en");

export function LanguageProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return createElement(RenderedLanguage.Provider, { value: lang }, children);
}

/** The site's language: the server's pick for this request, then the visitor's flag choices. */
export function useLanguage(): Lang {
  const rendered = useContext(RenderedLanguage);
  return useSyncExternalStore(subscribeLanguage, getLanguage, () => rendered);
}
