import type { Localized } from "@/i18n/language";

export type StepId = "understand" | "research" | "plan" | "build" | "verify";

export interface Step {
  id: StepId;
  name: Localized;
  summary: Localized;
  /** Project where this step mattered most. Adjust freely. */
  seenIn: string;
}

/** The five steps every project on this site is told with. */
export const steps: Step[] = [
  {
    id: "understand",
    name: { en: "Understand", fr: "Comprendre", fil: "Unawain" },
    summary: {
      en: "Find the real problem and who has it. Write down the limits: time, budget, team.",
      fr: "Trouver le vrai problème et qui l'a. Noter les limites : temps, budget, équipe.",
      fil: "Hanapin ang tunay na problema at kung sino ang may problema. Isulat ang mga limitasyon: oras, budget, team.",
    },
    seenIn: "groupe-fd-assurances",
  },
  {
    id: "research",
    name: { en: "Research", fr: "Se renseigner", fil: "Saliksikin" },
    summary: {
      en: "Read what already exists, in papers and in products, and compare the options before picking one.",
      fr: "Lire ce qui existe déjà, dans les articles et dans les produits, et comparer les options avant d'en choisir une.",
      fil: "Basahin kung ano na ang mayroon, sa mga papel at sa mga produkto, at ikumpara ang mga opsyon bago pumili.",
    },
    seenIn: "alten-labs",
  },
  {
    id: "plan",
    name: { en: "Plan", fr: "Planifier", fil: "Magplano" },
    summary: {
      en: "Choose an approach and say why. Prototype, split the roles, agree on how the team communicates.",
      fr: "Choisir une approche et dire pourquoi. Prototyper, répartir les rôles, s'accorder sur la communication de l'équipe.",
      fil: "Pumili ng paraan at sabihin kung bakit. Gumawa ng prototype, hatiin ang mga tungkulin, magkasundo kung paano mag-uusap ang team.",
    },
    seenIn: "piloteat",
  },
  {
    id: "build",
    name: { en: "Build", fr: "Construire", fil: "Buuin" },
    summary: {
      en: "Implement with the right tools, aiming for something responsive that will last.",
      fr: "Implémenter avec les bons outils, pour un résultat réactif et durable.",
      fil: "Ipatupad gamit ang tamang mga tool, para sa isang bagay na mabilis tumugon at tatagal.",
    },
    seenIn: "n7-consulting-edf",
  },
  {
    id: "verify",
    name: { en: "Verify and ship", fr: "Vérifier et livrer", fil: "Suriin at ilabas" },
    summary: {
      en: "Automated and manual tests, security, robustness. Release only what has been checked.",
      fr: "Tests automatisés et manuels, sécurité, robustesse. Ne livrer que ce qui a été vérifié.",
      fil: "Automated at manual na test, seguridad, tibay. Ilabas lamang ang nasuri na.",
    },
    seenIn: "piloteat",
  },
];
