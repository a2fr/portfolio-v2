/**
 * A piece of copy. `draft` marks a placeholder that still needs real content:
 * the site renders it as a dashed "To write" block so nothing invented is
 * mistaken for a fact.
 */
export interface Note {
  text: string;
  draft?: boolean;
}

export const fact = (text: string): Note => ({ text });
export const todo = (text: string): Note => ({ text, draft: true });
