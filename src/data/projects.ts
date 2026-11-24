import type { Localized } from "@/i18n/language";
import { fact, todo, type Note } from "./note";

export interface Option {
  name: string | Localized;
  verdict: "chosen" | "rejected";
  why: string | Localized;
  draft?: boolean;
}

export interface Project {
  slug: string;
  title: Localized;
  /** The problem in one line. */
  tagline: Localized;
  role: Note;
  period: Note;
  team: Note;
  result: Note;
  stack: string[];
  links: { label: Localized; href: string }[];
  understand: { problem: Note; constraints: Note[] };
  research: { existing: Note; options: Option[] };
  plan: { decision: Note; steps: Note[] };
  build: { summary: Note; hardParts: Note[] };
  verify: { checks: Note[]; outcome: Note; next: Note };
}

/** Placeholder options, so the "rejected / chosen" layout is visible before the real ones are written. */
const draftOptions = (topic: string): Option[] => [
  {
    name: "First option you considered",
    verdict: "rejected",
    why: `Why it lost for ${topic}: cost, time, risk, maintenance?`,
    draft: true,
  },
  {
    name: "Second option you considered",
    verdict: "rejected",
    why: "What it did well, and the reason it still was not enough.",
    draft: true,
  },
  {
    name: "The option you chose",
    verdict: "chosen",
    why: "The one or two reasons that decided it.",
    draft: true,
  },
];

export const projects: Project[] = [
  {
    slug: "piloteat",
    title: { en: "Piloteat", fr: "Piloteat", fil: "Piloteat" },
    tagline: { en: "A restaurant SaaS, running today with a real pilot restaurant: Kashmir Lounge.", fr: "Un SaaS pour la restauration, en service aujourd'hui avec un vrai restaurant pilote : Kashmir Lounge.", fil: "Isang SaaS para sa mga restawran, gumagana na ngayon kasama ang isang tunay na pilot na restawran: Kashmir Lounge." },
    role: fact({
      en: "Co-founder and full-stack engineer",
      fr: "Cofondateur et ingénieur full-stack",
      fil: "Co-founder at full-stack engineer",
    }),
    period: fact({
      en: "Jun 2026 to present",
      fr: "Depuis juin 2026",
      fil: "Mula Hunyo 2026 hanggang ngayon",
    }),
    team: todo("Team size and who does what"),
    result: fact({
      en: "Deployed and publicly reachable for the pilot",
      fr: "Déployé et accessible publiquement pour le pilote",
      fil: "Naka-deploy at bukas sa publiko para sa pilot",
    }),
    stack: ["Angular", "TypeScript", "Supabase", "PostgreSQL", "Stripe", "Vercel"],
    links: [{ label: { en: "Kashmir Lounge live pilot", fr: "Kashmir Lounge, le pilote en ligne", fil: "Kashmir Lounge, ang live na pilot" }, href: "https://kashmir-lounge.piloteat.com" }],
    understand: {
      problem: todo("What was Kashmir Lounge struggling with before Piloteat? Who felt it: the owner, the staff, the customers?"),
      constraints: [
        todo("Time: when did the pilot have to be live?"),
        todo("Budget: what could the product cost to run each month?"),
        todo("Team: how many people, how much time each?"),
      ],
    },
    research: {
      existing: todo("Which ordering and restaurant tools already existed, and what did they miss for this restaurant?"),
      options: draftOptions("the backend and hosting"),
    },
    plan: {
      decision: fact({
        en: "Supabase on PostgreSQL for data, authentication and realtime, with Stripe for payments and an Angular front end.",
        fr: "Supabase sur PostgreSQL pour les données, l'authentification et le temps réel, avec Stripe pour les paiements et un front-end Angular.",
        fil: "Supabase sa PostgreSQL para sa data, authentication at real time, kasama ang Stripe para sa mga bayad at front end sa Angular.",
      }),
      steps: [
        todo("Milestones: what shipped first, what waited"),
        todo("Roles: who owned product, design, code, the relationship with the restaurant"),
        todo("Communication: how you kept the restaurant and the team aligned"),
      ],
    },
    build: {
      summary: fact({
        en: "I work across the whole product: the Angular and TypeScript front end, the Supabase and PostgreSQL back end, authentication, realtime features and responsive interfaces.",
        fr: "Je travaille sur l'ensemble du produit : le front-end en Angular et TypeScript, le back-end Supabase et PostgreSQL, l'authentification, les fonctionnalités temps réel et les interfaces responsives.",
        fil: "Hawak ko ang buong produkto: ang front end sa Angular at TypeScript, ang back end sa Supabase at PostgreSQL, ang authentication, ang mga real-time na feature at ang mga responsive na interface.",
      }),
      hardParts: [
        todo("One hard technical point and how you solved it (realtime consistency, payments, access rules)"),
        todo("A second one"),
      ],
    },
    verify: {
      checks: [
        todo("Automated tests: what they cover"),
        todo("Manual tests: how you checked with the restaurant before release"),
        todo("Security: access rules, payment safety, what you hardened"),
      ],
      outcome: fact({
        en: "Piloteat runs with a real restaurant pilot, Kashmir Lounge. The pilot is deployed and publicly reachable.",
        fr: "Piloteat tourne avec un vrai restaurant pilote, Kashmir Lounge. Le pilote est déployé et accessible publiquement.",
        fil: "Gumagana ang Piloteat kasama ang isang tunay na pilot na restawran, ang Kashmir Lounge. Naka-deploy ang pilot at bukas ito sa publiko.",
      }),
      next: todo("What you would do differently, and what the pilot taught you"),
    },
  },
  {
    slug: "n7-consulting-edf",
    title: { en: "EDF alarm-test automation", fr: "Automatisation des tests d'alarme EDF", fil: "Automation ng alarm test ng EDF" },
    tagline: { en: "Automate the testing of industrial alarm systems across Modbus, MQTT and telephony.", fr: "Automatiser les tests de systèmes d'alarme industriels, via Modbus, MQTT et la téléphonie.", fil: "Pag-automate ng mga test ng mga industrial na alarm system, gamit ang Modbus, MQTT at telepono." },
    role: fact({
      en: "Python developer and software consultant, via N7 Consulting",
      fr: "Développeur Python et consultant logiciel, via N7 Consulting",
      fil: "Python developer at software consultant, sa pamamagitan ng N7 Consulting",
    }),
    period: fact({
      en: "Oct 2024 to Mar 2025",
      fr: "Oct. 2024 – mars 2025",
      fil: "Okt. 2024 – Mar. 2025",
    }),
    team: todo("Team size and your part in it"),
    result: todo("Result to add: time saved, tests covered, adoption by EDF"),
    stack: ["Python", "Linux", "Modbus", "MQTT", "DTMF"],
    links: [],
    understand: {
      problem: todo("How were the alarm systems tested before? What made it slow or risky, and for whom?"),
      constraints: [
        todo("Time: length of the mission and the deadlines inside it"),
        todo("Budget: the days sold by N7 Consulting"),
        todo("Environment: what you could and could not touch on EDF systems"),
      ],
    },
    research: {
      existing: todo("Which libraries, tools or earlier scripts existed for Modbus, MQTT and DTMF testing?"),
      options: draftOptions("the test architecture"),
    },
    plan: {
      decision: todo("The approach you chose and the reason, in two sentences"),
      steps: [
        todo("Milestones agreed with the client"),
        todo("Roles inside the consulting team"),
        todo("Communication: how you reported progress to EDF"),
      ],
    },
    build: {
      summary: fact({
        en: "Python automation on Linux that tests industrial alarm systems through Modbus, MQTT and telephony workflows, including DTMF signalling.",
        fr: "Une automatisation Python sous Linux qui teste des systèmes d'alarme industriels via Modbus, MQTT et des scénarios téléphoniques, signalisation DTMF comprise.",
        fil: "Python automation sa Linux na tumetest ng mga industrial na alarm system gamit ang Modbus, MQTT at mga daloy ng telepono, kasama ang DTMF signalling.",
      }),
      hardParts: [
        todo("One hard technical point (timing, hardware access, flaky signals) and how you solved it"),
        todo("A second one"),
      ],
    },
    verify: {
      checks: [
        todo("How you proved the automation itself was reliable"),
        todo("Manual checks against the real systems"),
        todo("Robustness: what happens when a device does not answer"),
      ],
      outcome: todo("What EDF could do after the mission that it could not do before"),
      next: todo("What you would do differently"),
    },
  },
  {
    slug: "alten-labs",
    title: { en: "Alten Labs digital twin", fr: "Jumeau numérique des Alten Labs", fil: "Digital twin ng Alten Labs" },
    tagline: { en: "A digital twin of the Alten labs that people can walk through and use in VR and mixed reality.", fr: "Un jumeau numérique des labs d'Alten, que l'on peut parcourir et utiliser en VR et en réalité mixte.", fil: "Isang digital twin ng mga lab ng Alten na maaaring lakarin at gamitin sa VR at mixed reality." },
    role: fact({
      en: "XR software developer intern",
      fr: "Stagiaire développeur logiciel XR",
      fil: "XR software developer intern",
    }),
    period: fact({
      en: "Sep 2025 to Mar 2026",
      fr: "Sept. 2025 – mars 2026",
      fil: "Set. 2025 – Mar. 2026",
    }),
    team: todo("Team size and your part in it"),
    result: todo("Result to add: what the twin lets Alten do now"),
    stack: ["Godot", "OpenXR", "ROS", "Azure DevOps"],
    links: [],
    understand: {
      problem: todo("Why did Alten want a digital twin of its labs? Who uses it and for what?"),
      constraints: [
        todo("Time: six months, and the demos or deadlines inside them"),
        todo("Hardware: which headsets, which performance limits"),
        todo("Team: who you depended on"),
      ],
    },
    research: {
      existing: todo("What you read or tested first: papers on VR locomotion and hand tracking, existing Godot XR tools"),
      options: draftOptions("locomotion and interaction"),
    },
    plan: {
      decision: fact({
        en: "Godot with the OpenXR standard, with hand tracking, teleportation and direct grabbing as the interaction model.",
        fr: "Godot avec le standard OpenXR, avec le suivi des mains, la téléportation et la saisie directe comme modèle d'interaction.",
        fil: "Godot gamit ang OpenXR standard, na may hand tracking, teleportation at direktang paghawak bilang paraan ng interaksyon.",
      }),
      steps: [
        todo("Milestones: prototype, first usable scene, final demo"),
        todo("Roles in the team"),
        fact({
          en: "Collaboration and delivery organised through Azure DevOps.",
          fr: "Collaboration et livraisons organisées avec Azure DevOps.",
          fil: "Ang kolaborasyon at paghahatid ay inayos sa pamamagitan ng Azure DevOps.",
        }),
      ],
    },
    build: {
      summary: fact({
        en: "VR and mixed-reality interactions built with Godot and OpenXR: hand tracking, teleportation-based movement and direct object manipulation, in a digital-twin and ROS context.",
        fr: "Des interactions en VR et en réalité mixte construites avec Godot et OpenXR : suivi des mains, déplacement par téléportation et manipulation directe des objets, dans un contexte de jumeau numérique et de ROS.",
        fil: "Mga interaksyon sa VR at mixed reality na binuo gamit ang Godot at OpenXR: hand tracking, paggalaw sa pamamagitan ng teleportation at direktang paghawak ng mga bagay, sa konteksto ng digital twin at ROS.",
      }),
      hardParts: [
        todo("One hard technical point (hand-tracking reliability, comfort, ROS link) and how you solved it"),
        todo("A second one"),
      ],
    },
    verify: {
      checks: [
        todo("How you tested interactions: with which users, on which headsets"),
        todo("Automated checks, if any"),
        todo("Comfort and robustness: tracking loss, edge cases"),
      ],
      outcome: todo("What was delivered at the end of the internship"),
      next: todo("What you would do differently"),
    },
  },
  {
    slug: "groupe-fd-assurances",
    title: { en: "Insurance broker automation", fr: "Automatisation pour un courtier en assurances", fil: "Automation para sa isang insurance broker" },
    tagline: { en: "Semi-automate the simple but time-consuming tasks of an insurance brokerage.", fr: "Semi-automatiser les tâches simples mais chronophages d'un cabinet de courtage en assurances.", fil: "Bahagyang pag-automate ng mga simple pero matagal na gawain ng isang insurance brokerage." },
    role: todo("Your title during the internship"),
    period: todo("Dates to add"),
    team: todo("Team size and who you worked with"),
    result: todo("Result to add: tasks automated, time saved per week"),
    stack: ["Electron.js"],
    links: [],
    understand: {
      problem: todo("Which tasks were eating the brokers' time? How did you find out which ones were worth automating?"),
      constraints: [
        todo("Time: length of the internship"),
        todo("Budget: what an SME could afford to run and maintain"),
        todo("Users: brokers who are not developers"),
      ],
    },
    research: {
      existing: todo("Which tools did the firm already use, and which off-the-shelf products did you look at?"),
      options: draftOptions("a small firm with no IT team"),
    },
    plan: {
      decision: fact({
        en: "A desktop application built with Electron.js, so the brokers keep control of each step while the repetitive part is automated.",
        fr: "Une application de bureau construite avec Electron.js, pour que les courtiers gardent la main sur chaque étape pendant que la partie répétitive est automatisée.",
        fil: "Isang desktop application na binuo gamit ang Electron.js, para hawak pa rin ng mga broker ang bawat hakbang habang naka-automate ang paulit-ulit na bahagi.",
      }),
      steps: [
        todo("Milestones: which task you automated first and why"),
        todo("How you collected feedback from the brokers"),
        todo("How you documented the tool for after you left"),
      ],
    },
    build: {
      summary: fact({
        en: "A desktop application built with Electron.js for business tooling and automation, in an insurance SME.",
        fr: "Une application de bureau construite avec Electron.js pour l'outillage métier et l'automatisation, dans une PME d'assurance.",
        fil: "Isang desktop application na binuo gamit ang Electron.js para sa mga tool sa negosyo at automation, sa isang maliit na kompanya ng insurance.",
      }),
      hardParts: [
        todo("One hard technical point and how you solved it"),
        todo("A second one"),
      ],
    },
    verify: {
      checks: [
        todo("How you tested with real cases from the brokers"),
        todo("Data safety: client data, access, backups"),
        todo("What happens when the automation fails halfway"),
      ],
      outcome: todo("What changed in the brokers' daily work"),
      next: todo("What you would do differently"),
    },
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export type { Note };
