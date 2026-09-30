export interface ProfileLink {
  label: string;
  handle: string;
  href: string;
}

export interface Genre {
  name: string;
  instruments: string[];
}

export const profile = {
  name: "Alan Fresco",
  initials: "AF",
  title: "Software Engineer",
  specialty: "Backend & Full-Stack",
  status: "Open to full-time software engineering roles",
  /** Short placeholder bio — to be refined. */
  bio: [
    "I’m a software engineer focused on backend and full-stack development. I like building complete products — from the database and the API to the interface people actually use.",
    "My work so far spans a restaurant SaaS running with a real pilot, XR interaction development, industrial test automation, desktop tooling, mobile and computer-vision experiments.",
  ],
  /** Secondary signals, presented as sonic influences. */
  influences: [
    "Product building",
    "Creative engineering",
    "Interactive systems",
    "Automation",
    "XR",
    "Mobile",
    "Computer vision",
  ],
  links: [
    { label: "GitHub", handle: "a2fr", href: "https://github.com/a2fr" },
    { label: "LinkedIn", handle: "alan-fresco", href: "https://www.linkedin.com/in/alan-fresco/" },
  ] satisfies ProfileLink[],
  /** Not published yet — rendered as "coming soon", never as a link. */
  resumeUrl: null as string | null,
  email: null as string | null,
  /** Skills grouped as genres; instruments all come from the discography. */
  genres: [
    { name: "Backend & Data", instruments: ["PostgreSQL", "Supabase", "Python", "Authentication", "Realtime", "Stripe"] },
    { name: "Front-end & Product", instruments: ["Angular", "TypeScript", "Responsive UX", "Electron.js"] },
    { name: "XR & Interactive", instruments: ["Godot", "OpenXR", "Unity", "C#", "Hand tracking"] },
    { name: "Automation & Systems", instruments: ["Linux", "Modbus", "MQTT", "DTMF", "ROS", "Azure DevOps"] },
    { name: "Mobile", instruments: ["Kotlin", "Android"] },
    { name: "Computer Vision", instruments: ["Python", "Image processing", "Algorithms"] },
  ] satisfies Genre[],
};
