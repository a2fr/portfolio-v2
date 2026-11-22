import type { Note } from "@/data/note";

/** Renders a piece of copy, or a visible placeholder when it still has to be written. */
export function NoteText({ note, className = "" }: { note: Note; className?: string }) {
  if (!note.draft) return <span className={className}>{note.text}</span>;
  return (
    <span className="inline-block border border-dashed border-cobalt/70 bg-cobalt/5 px-2.5 py-1 text-[0.9375rem] leading-snug font-normal tracking-normal text-cobalt">
      <span className="font-medium">To write: </span>
      {note.text}
    </span>
  );
}
