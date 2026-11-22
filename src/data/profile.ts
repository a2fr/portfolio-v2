import { todo, type Note } from "./note";

export interface EducationEntry {
  school: Note;
  degree: Note;
  period: Note;
  detail: Note;
}

export const profile = {
  name: "Alan Fresco",
  role: "Computer engineer",
  fields: ["AI", "Full-stack", "Software"],
  intro:
    "Computer engineer working across AI, full-stack and software. Before I write or prompt anything, I find the real problem, look at what already exists, and plan the work around the time, budget and team available.",
  links: [
    { label: "GitHub", href: "https://github.com/a2fr" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alan-fresco/" },
  ],
  /** Not published yet. Rendered as a placeholder until set. */
  email: null as string | null,
  resumeUrl: null as string | null,
  education: [
    {
      school: todo("Engineering school name"),
      degree: todo("Degree and specialisation"),
      period: todo("Years"),
      detail: todo("One line: main subjects, or what this school taught you about working as an engineer"),
    },
    {
      school: todo("Previous step (preparatory classes, bachelor, exchange)"),
      degree: todo("Degree or programme"),
      period: todo("Years"),
      detail: todo("One line on what you took from it"),
    },
  ] satisfies EducationEntry[],
};
