"use client";

import type { Note } from "@/data/note";
import { useLanguage } from "@/i18n/language";
import { strings } from "@/i18n/strings";

/** Renders a piece of copy in the site's language, or a visible placeholder when it still has to be written. */
export function NoteText({ note, className = "" }: { note: Note; className?: string }) {
  const lang = useLanguage();
  const text = typeof note.text === "string" ? note.text : note.text[lang];
  if (!note.draft) return <span className={className}>{text}</span>;
  return (
    <span className="inline-block border border-dashed border-cobalt/70 bg-cobalt/5 px-2.5 py-1 text-[0.9375rem] leading-snug font-normal tracking-normal text-cobalt">
      <span className="font-medium">{strings[lang].toWrite}</span>
      {text}
    </span>
  );
}
