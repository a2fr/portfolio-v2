import { todo, type Note } from "./note";

/**
 * The CV shown on the sheet of paper on the desk. Every `todo(...)` renders as a dashed placeholder;
 * replace it with `fact("...")` (from ./note) once the real line is written.
 */
export interface ResumeEntry {
  title: Note;
  place: Note;
  period: Note;
  detail: Note;
}

export const resume = {
  headline: todo("One line: the kind of engineer you are and what you are looking for"),
  contact: todo("City · email · phone"),
  experience: [
    {
      title: todo("Job title"),
      place: todo("Company"),
      period: todo("Dates"),
      detail: todo("What you built or changed, with a result"),
    },
    {
      title: todo("Job title"),
      place: todo("Company"),
      period: todo("Dates"),
      detail: todo("What you built or changed, with a result"),
    },
  ] satisfies ResumeEntry[],
  education: [
    {
      title: todo("Degree and specialisation"),
      place: todo("School"),
      period: todo("Years"),
      detail: todo("Main subjects"),
    },
  ] satisfies ResumeEntry[],
  skills: todo("Languages, frameworks, tools"),
  languages: todo("Spoken languages and levels"),
};
