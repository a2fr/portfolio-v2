import { fact, todo, type Note } from "./note";

export interface Option {
  name: string;
  verdict: "chosen" | "rejected";
  why: string;
  draft?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  /** The problem in one line, shown on the home page. */
  tagline: string;
  role: Note;
  period: Note;
  team: Note;
  result: Note;
  stack: string[];
  links: { label: string; href: string }[];
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
    title: "Piloteat",
    tagline: "A restaurant SaaS, running today with a real pilot restaurant: Kashmir Lounge.",
    role: fact("Co-founder and full-stack engineer"),
    period: fact("Jul 2026 to present"),
    team: todo("Team size and who does what"),
    result: fact("Deployed and publicly reachable for the pilot"),
    stack: ["Angular", "TypeScript", "Supabase", "PostgreSQL", "Stripe", "Vercel"],
    links: [{ label: "Kashmir Lounge live pilot", href: "https://kashmir-lounge.vercel.app" }],
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
      decision: fact("Supabase on PostgreSQL for data, authentication and realtime, with Stripe for payments and an Angular front end."),
      steps: [
        todo("Milestones: what shipped first, what waited"),
        todo("Roles: who owned product, design, code, the relationship with the restaurant"),
        todo("Communication: how you kept the restaurant and the team aligned"),
      ],
    },
    build: {
      summary: fact("I work across the whole product: the Angular and TypeScript front end, the Supabase and PostgreSQL back end, authentication, realtime features and responsive interfaces."),
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
      outcome: fact("Piloteat runs with a real restaurant pilot, Kashmir Lounge. The pilot is deployed and publicly reachable."),
      next: todo("What you would do differently, and what the pilot taught you"),
    },
  },
  {
    slug: "n7-consulting-edf",
    title: "EDF alarm-test automation",
    tagline: "Automate the testing of industrial alarm systems across Modbus, MQTT and telephony.",
    role: fact("Python developer and software consultant, via N7 Consulting"),
    period: fact("Oct 2024 to Mar 2025"),
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
      summary: fact("Python automation on Linux that tests industrial alarm systems through Modbus, MQTT and telephony workflows, including DTMF signalling."),
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
    title: "Alten Labs digital twin",
    tagline: "A digital twin of the Alten labs that people can walk through and use in VR and mixed reality.",
    role: fact("XR software developer intern"),
    period: fact("Sep 2025 to Mar 2026"),
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
      decision: fact("Godot with the OpenXR standard, with hand tracking, teleportation and direct grabbing as the interaction model."),
      steps: [
        todo("Milestones: prototype, first usable scene, final demo"),
        todo("Roles in the team"),
        fact("Collaboration and delivery organised through Azure DevOps."),
      ],
    },
    build: {
      summary: fact("VR and mixed-reality interactions built with Godot and OpenXR: hand tracking, teleportation-based movement and direct object manipulation, in a digital-twin and ROS context."),
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
    title: "Insurance broker automation",
    tagline: "Semi-automate the simple but time-consuming tasks of an insurance brokerage.",
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
      decision: fact("A desktop application built with Electron.js, so the brokers keep control of each step while the repetitive part is automated."),
      steps: [
        todo("Milestones: which task you automated first and why"),
        todo("How you collected feedback from the brokers"),
        todo("How you documented the tool for after you left"),
      ],
    },
    build: {
      summary: fact("A desktop application built with Electron.js for business tooling and automation, in an insurance SME."),
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
