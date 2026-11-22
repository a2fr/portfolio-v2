export type StepId = "understand" | "research" | "plan" | "build" | "verify";

export interface Step {
  id: StepId;
  name: string;
  summary: string;
  /** Project where this step mattered most. Adjust freely. */
  seenIn: string;
}

/** The five steps every project on this site is told with. */
export const steps: Step[] = [
  {
    id: "understand",
    name: "Understand",
    summary: "Find the real problem and who has it. Write down the limits: time, budget, team.",
    seenIn: "groupe-fd-assurances",
  },
  {
    id: "research",
    name: "Research",
    summary: "Read what already exists, in papers and in products, and compare the options before picking one.",
    seenIn: "alten-labs",
  },
  {
    id: "plan",
    name: "Plan",
    summary: "Choose an approach and say why. Prototype, split the roles, agree on how the team communicates.",
    seenIn: "piloteat",
  },
  {
    id: "build",
    name: "Build",
    summary: "Implement with the right tools, aiming for something responsive that will last.",
    seenIn: "n7-consulting-edf",
  },
  {
    id: "verify",
    name: "Verify and ship",
    summary: "Automated and manual tests, security, robustness. Release only what has been checked.",
    seenIn: "piloteat",
  },
];
