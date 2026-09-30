import type { Album, AlbumKind } from "@/types/album";

/**
 * The discography. Every project / experience of the portfolio lives here —
 * pages and components only render this data.
 *
 * Copy is intentionally concise and limited to confirmed facts.
 * Dates are only set where they are confirmed.
 */
export const albums: Album[] = [
  {
    slug: "piloteat",
    catalog: "AF-001",
    title: "Piloteat",
    subtitle: "Restaurant SaaS, live with a real restaurant pilot",
    kind: "main-release",
    role: "Co-founder & Full-Stack Software Engineer",
    period: "Jul 2026 – Present",
    year: "2026",
    summary:
      "Piloteat is a restaurant SaaS product I co-founded and build end-to-end as its full-stack engineer. It is running today with a real restaurant pilot: Kashmir Lounge.",
    stack: ["Angular", "TypeScript", "Supabase", "PostgreSQL", "Stripe"],
    tags: ["Full-Stack", "SaaS", "Authentication", "Realtime", "Responsive UX", "Deployment"],
    tracks: [
      {
        title: "The Idea",
        notes:
          "A SaaS product for restaurants, co-founded and built from the ground up — product thinking and engineering in the same seat.",
      },
      {
        title: "Building the Product",
        notes:
          "As co-founder and full-stack engineer I work across the whole product: the Angular and TypeScript front end, the Supabase / PostgreSQL back end, authentication, realtime features and responsive interfaces.",
      },
      {
        title: "Real Restaurant Pilot",
        notes:
          "Piloteat runs with a real restaurant pilot, Kashmir Lounge. The pilot is deployed and publicly reachable.",
      },
      {
        title: "Tech Stack",
        notes:
          "Angular and TypeScript on the front end. Supabase on PostgreSQL for data, authentication and realtime. Stripe for payments. Deployed to production for the pilot.",
      },
      {
        title: "Challenges",
        notes:
          "Shipping software for a real business means balancing speed with reliability: consistent realtime data, secure authentication, payment integration and an experience that holds up on every screen size.",
      },
      {
        title: "What’s Next",
        notes: "Learning from the pilot and iterating on the product.",
      },
    ],
    links: [
      {
        label: "Kashmir Lounge — live pilot",
        href: "https://kashmir-lounge.vercel.app",
        description: "The restaurant pilot running on Piloteat.",
      },
    ],
    cover: {
      variant: "plate",
      background:
        "radial-gradient(circle at 30% 22%, #ffc06a 0%, #ec6a33 36%, #8a2612 72%, #3b0e06 100%)",
      ink: "#fff4e6",
      accent: "#2a0b04",
    },
  },
  {
    slug: "alten-labs",
    catalog: "AF-002",
    title: "Alten Labs",
    subtitle: "Extended reality, VR interaction & digital twins",
    kind: "era",
    role: "XR Software Developer Intern",
    period: "Sep 2025 – Mar 2026",
    year: "2025–26",
    summary:
      "An XR software development internship: building VR and mixed-reality interactions with Godot and OpenXR, in digital-twin and ROS contexts.",
    stack: ["Godot", "OpenXR", "ROS", "Azure DevOps"],
    tags: ["XR", "VR", "Mixed Reality", "Hand Tracking", "Digital Twin"],
    tracks: [
      {
        title: "Godot × OpenXR",
        notes: "Developing XR experiences with the Godot engine and the OpenXR standard.",
      },
      {
        title: "Hand Tracking",
        notes: "VR interactions driven by hand tracking.",
      },
      {
        title: "Teleport & Grab",
        notes: "Teleportation-based locomotion and direct object manipulation in VR.",
      },
      {
        title: "Digital Twin",
        notes: "Digital-twin and mixed-reality scenarios.",
      },
      {
        title: "ROS",
        notes: "Working with ROS as part of the project’s technical environment.",
      },
      {
        title: "Team Workflow",
        notes: "Collaboration and delivery organised through Azure DevOps.",
      },
    ],
    links: [],
    cover: {
      variant: "horizon",
      background: "linear-gradient(180deg, #070f24 0%, #16316b 55%, #2f5ea8 85%, #4f82cf 100%)",
      ink: "#dcecff",
      accent: "#ffffff",
    },
  },
  {
    slug: "n7-consulting-edf",
    catalog: "AF-003",
    title: "N7 Consulting / EDF",
    subtitle: "Automation for industrial alarm-system testing",
    kind: "era",
    role: "Python Developer / Software Consultant",
    period: "Oct 2024 – Mar 2025",
    year: "2024–25",
    summary:
      "A consulting mission as a Python developer for EDF: automating industrial alarm-system testing on Linux, across Modbus, MQTT and telephony (DTMF) workflows.",
    stack: ["Python", "Linux", "Modbus", "MQTT", "DTMF"],
    tags: ["Automation", "Industrial Systems", "Testing", "Telephony"],
    tracks: [
      {
        title: "Python on Linux",
        notes: "Python automation running in Linux environments.",
      },
      {
        title: "Alarm-System Testing",
        notes: "Automating the testing of industrial alarm systems.",
      },
      {
        title: "Modbus & MQTT",
        notes: "Working with the Modbus and MQTT protocols.",
      },
      {
        title: "Telephony & DTMF",
        notes: "Telephony workflows, including DTMF signalling.",
      },
    ],
    links: [],
    cover: {
      variant: "signal",
      background: "linear-gradient(140deg, #1d1810 0%, #2d2213 55%, #120f0a 100%)",
      ink: "#f4b646",
      accent: "#ff6b3d",
    },
  },
  {
    slug: "groupe-fd-assurances",
    catalog: "AF-004",
    title: "Groupe FD Assurances",
    subtitle: "Desktop business tooling with Electron.js",
    kind: "ep",
    summary:
      "A desktop application built with Electron.js for business tooling and automation, in an insurance SME environment.",
    stack: ["Electron.js"],
    tags: ["Desktop App", "Business Tooling", "Automation", "Insurance"],
    tracks: [
      {
        title: "The Context",
        notes: "An insurance SME environment, where internal tooling supports day-to-day work.",
      },
      {
        title: "Desktop Application",
        notes: "A desktop application built with Electron.js.",
      },
      {
        title: "Automation",
        notes: "Business tooling focused on automation.",
      },
    ],
    links: [],
    cover: {
      variant: "panes",
      background: "linear-gradient(160deg, #e6e0d2 0%, #c4bca8 100%)",
      ink: "#1d2826",
      accent: "#3f6159",
    },
  },
  {
    slug: "vr-crane-simulator",
    catalog: "AF-005",
    title: "VR Construction Crane Simulator",
    subtitle: "Crane operation, simulated in virtual reality",
    kind: "b-side",
    summary: "A virtual-reality construction crane simulator built with Unity and C#.",
    stack: ["Unity", "C#"],
    tags: ["VR", "Simulation", "Interactive Systems"],
    tracks: [
      { title: "Unity & C#", notes: "Built with the Unity engine, scripted in C#." },
      { title: "Simulation", notes: "Simulating the operation of a construction crane." },
      { title: "In VR", notes: "An interactive system experienced in virtual reality." },
    ],
    links: [],
    cover: {
      variant: "lattice",
      background: "linear-gradient(150deg, #f6c935 0%, #e39a14 100%)",
      ink: "#17140f",
      accent: "#17140f",
    },
  },
  {
    slug: "computer-vision",
    catalog: "AF-006",
    title: "Computer Vision",
    subtitle: "Image-processing experiments in Python",
    kind: "b-side",
    summary: "Experiments in image processing and computer-vision algorithms, written in Python.",
    stack: ["Python"],
    tags: ["Computer Vision", "Image Processing", "Algorithms", "Experimentation"],
    tracks: [
      { title: "Image Processing", notes: "Working directly with images and pixels in Python." },
      { title: "Algorithms", notes: "Implementing and exploring computer-vision algorithms." },
      { title: "Experimentation", notes: "A space for trying ideas and comparing approaches." },
    ],
    links: [],
    cover: {
      variant: "pixels",
      background: "linear-gradient(135deg, #16191a 0%, #0c0e0f 100%)",
      ink: "#e9e4da",
      accent: "#ff5277",
    },
  },
  {
    slug: "android-app",
    catalog: "AF-007",
    title: "Android App",
    subtitle: "A native mobile app in Kotlin",
    kind: "b-side",
    summary: "A native Android application written in Kotlin, with attention to app architecture and mobile UI.",
    stack: ["Kotlin", "Android"],
    tags: ["Mobile", "App Architecture", "Mobile UI"],
    tracks: [
      { title: "Kotlin", notes: "Written in Kotlin for the Android platform." },
      { title: "Architecture", notes: "Structuring the application’s architecture." },
      { title: "Mobile UI", notes: "Designing and building the mobile interface." },
    ],
    links: [],
    cover: {
      variant: "modules",
      background: "linear-gradient(160deg, #f3cdb9 0%, #d8866f 100%)",
      ink: "#2b140e",
      accent: "#fff4ee",
    },
  },
];

export const albumKindLabel: Record<AlbumKind, string> = {
  "main-release": "Main Release",
  era: "Era",
  ep: "EP",
  "b-side": "B-Side",
};

export const albumKindDescription: Record<AlbumKind, string> = {
  "main-release": "Flagship product",
  era: "Professional experience",
  ep: "Professional project",
  "b-side": "Side project",
};

export function getAlbum(slug: string): Album | undefined {
  return albums.find((album) => album.slug === slug);
}

export function getAlbumsByKind(...kinds: AlbumKind[]): Album[] {
  return albums.filter((album) => kinds.includes(album.kind));
}

export const flagship = albums.find((album) => album.kind === "main-release") ?? albums[0];
