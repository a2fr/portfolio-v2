import { fact, todo, type Note } from "./note";

export interface EducationEntry {
  school: Note;
  degree: Note;
  period: Note;
  detail: Note;
  /**
   * Ribbon and wax colours, on the shelf roll and on the certificate: "classic" is gold satin with red wax,
   * "inverse" their opposites, blue satin with green wax.
   */
  seal: "classic" | "inverse";
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
    // Most recent first; the timeline alternates them right, left, right of the cord.
    {
      school: fact("UQAC, Université du Québec à Chicoutimi"),
      degree: fact({
        en: "Master's degree in computer science",
        fr: "Maîtrise en informatique",
        fil: "Master's degree sa computer science",
      }),
      period: fact("2024 – 2026"),
      detail: fact({
        en: "Double degree with ENSEEIHT · Video game specialisation",
        fr: "Double diplôme avec l'ENSEEIHT · Spécialisation jeux vidéo",
        fil: "Double degree kasama ang ENSEEIHT · Espesyalisasyon sa video games",
      }),
      seal: "classic",
    },
    {
      school: fact("ENSEEIHT, Toulouse INP"),
      degree: fact({
        en: "Engineering degree (Diplôme d'ingénieur) in computer science",
        fr: "Diplôme d'ingénieur en informatique",
        fil: "Engineering degree (Diplôme d'ingénieur) sa computer science",
      }),
      period: fact("2022 – 2026"),
      detail: fact({
        en: "Algorithms, networks, distributed systems, software development",
        fr: "Algorithmique, réseaux, systèmes distribués, développement logiciel",
        fil: "Mga algorithm, network, distributed system, at software development",
      }),
      seal: "classic",
    },
    // Baccalauréat and preparatory classes were taken at the same school, so they share one certificate.
    {
      school: fact("Lycée Jean-Baptiste Say, Paris"),
      degree: fact({
        en: "Baccalauréat, then PTSI / PT* preparatory classes",
        fr: "Baccalauréat, puis classes préparatoires PTSI / PT*",
        fil: "Baccalauréat, pagkatapos ay PTSI / PT* preparatory classes",
      }),
      period: todo("Years"),
      detail: todo("One line on what you took from it"),
      seal: "inverse",
    },
  ] satisfies EducationEntry[],
};
