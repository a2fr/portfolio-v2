"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BAR_PX, DOCK_APPS, DOCK_PX, type DockAppId } from "./desktopArt";
import { type Lang, useLanguage } from "@/i18n/language";
import { strings } from "@/i18n/strings";

interface AppCopy {
  tagline: string;
  facts: [label: string, text: string][];
  sections: { title: string; lines: string[] }[];
  /** Labels of `AppContent.links`, in the same order. */
  linkLabels: string[];
}

interface AppContent {
  /** Case study page under /projects. */
  slug: string;
  title: string;
  stack: string[];
  links: string[];
  /** Brand colour of the stack chips and the main button. */
  accent: string;
  copy: Record<Lang, AppCopy>;
}

const APPS: Record<DockAppId, AppContent> = {
  piloteat: {
    slug: "piloteat",
    title: "Piloteat",
    stack: ["Angular", "TypeScript", "Supabase", "PostgreSQL", "Stripe", "Vercel"],
    links: ["https://kashmir-lounge.piloteat.com"],
    accent: "#f0b52a",
    copy: {
      fr: {
        tagline: "Un SaaS pour la restauration, en service aujourd'hui avec un vrai restaurant pilote : Kashmir Lounge.",
        facts: [
          ["Rôle", "Cofondateur et ingénieur full-stack"],
          ["Période", "Depuis juin 2026"],
          ["Résultat", "Déployé et accessible publiquement pour le pilote"],
        ],
        sections: [
          {
            title: "Ce que je construis",
            lines: [
              "Conception et développement, en équipe de deux, d'une plateforme SaaS multi-restaurants : site de commande, écran cuisine temps réel et back-office (carte, statistiques, fidélité, codes promo, QR codes).",
            ],
          },
          {
            title: "Architecture",
            lines: [
              "Angular et TypeScript côté front-end, Supabase et PostgreSQL côté données.", "Authentification, règles d'accès (RLS), 24 fonctions serverless et paiements Stripe, remboursements et litiges compris.",
            ],
          },
          {
            title: "Où en est le projet",
            lines: ["En production depuis novembre 2026 chez un premier restaurant, Kashmir Lounge : commandes et paiements réels.", "Un simulateur d'économies projette environ 90 % de frais en moins par commande face aux plateformes de livraison.", "Produit livré en cinq mois : 1 200+ commits, 187 pull requests fusionnées, 175+ migrations de base de données et 420+ fichiers de tests automatisés, dont des tests E2E Playwright."],
          },
        ],
        linkLabels: ["Kashmir Lounge en ligne"],
      },
      en: {
        tagline: "A restaurant SaaS, running today with a real pilot restaurant: Kashmir Lounge.",
        facts: [
          ["Role", "Co-founder and full-stack engineer"],
          ["Period", "Since June 2026"],
          ["Result", "Deployed and publicly reachable for the pilot"],
        ],
        sections: [
          {
            title: "What I am building",
            lines: [
              "Designed and built, in a team of two, a multi-restaurant SaaS platform: ordering site, real-time kitchen screen and back office (menu, statistics, loyalty, promo codes, QR codes).",
            ],
          },
          {
            title: "Architecture",
            lines: ["Angular and TypeScript on the front end, Supabase and PostgreSQL for the data.", "Authentication, access rules (RLS), 24 serverless functions and Stripe payments, including refunds and disputes."],
          },
          {
            title: "Where the project stands",
            lines: ["In production since November 2026 at a first restaurant, Kashmir Lounge, with real orders and payments.", "A savings simulator projects about 90% lower fees per order compared with delivery platforms.", "Shipped in five months: 1,200+ commits, 187 merged pull requests, 175+ database migrations and 420+ automated test files, including Playwright end-to-end tests."],
          },
        ],
        linkLabels: ["Kashmir Lounge live"],
      },
      fil: {
        tagline: "Isang SaaS para sa mga restawran, gumagana na ngayon kasama ang isang tunay na pilot na restawran: Kashmir Lounge.",
        facts: [
          ["Tungkulin", "Co-founder at full-stack engineer"],
          ["Panahon", "Mula Hunyo 2026"],
          ["Resulta", "Naka-deploy at bukas sa publiko para sa pilot"],
        ],
        sections: [
          {
            title: "Ang aking binubuo",
            lines: [
              "Dinisenyo at binuo, sa team na dalawa kami, ang isang SaaS platform para sa maraming restawran: site para sa pag-order, real-time na screen sa kusina at back office (menu, estadistika, loyalty, promo code, QR code).",
            ],
          },
          {
            title: "Arkitektura",
            lines: [
              "Angular at TypeScript sa front end, Supabase at PostgreSQL para sa data.", "Authentication, mga access rule (RLS), 24 na serverless function at mga bayad sa Stripe, kasama ang mga refund at dispute.",
            ],
          },
          {
            title: "Kalagayan ng proyekto",
            lines: [
              "Nasa production mula Nobyembre 2026 sa unang restawran, ang Kashmir Lounge, na may totoong mga order at bayad.", "May savings simulator na nagpapakita ng humigit-kumulang 90% na mas mababang bayarin kada order kumpara sa mga delivery platform.", "Naihatid ang produkto sa loob ng limang buwan: 1,200+ commit, 187 na na-merge na pull request, 175+ database migration at 420+ automated test file, kasama ang mga E2E test sa Playwright.",
            ],
          },
        ],
        linkLabels: ["Kashmir Lounge online"],
      },
    },
  },
  alten: {
    slug: "alten-labs",
    title: "Alten Labs",
    stack: ["Godot", "OpenXR", "ROS", "Azure DevOps"],
    links: [],
    accent: "#ffe11a",
    copy: {
      fr: {
        tagline: "Projet de fin d'études : un jumeau numérique interactif des labs d'Alten, à explorer en VR et en réalité mixte.",
        facts: [
          ["Rôle", "Développeur XR"],
          ["Période", "Sept. 2025 – mars 2026"],
          ["Cadre", "Projet de fin d'études (PFE)"],
        ],
        sections: [
          {
            title: "Ce que j'ai fait",
            lines: [
              "Refonte complète du jumeau numérique des bureaux et du laboratoire d'Alten avec Godot et OpenXR, un démonstrateur qui sert à commercialiser cette offre auprès de clients.",
              "Développement de cinq modes adaptés aux performances de l'appareil : 2D, 3D, 3D explorable et interactive, VR (manettes ou suivi des mains) et prototype de réalité mixte avec ancres spatiales.",
              "Modélisation du laboratoire sous Blender, intégration en binôme de capteurs ROS en temps réel, méthode Agile avec Azure DevOps.",
            ],
          },
        ],
        linkLabels: [],
      },
      en: {
        tagline: "Final-year project: an interactive digital twin of Alten's labs, to explore in VR and mixed reality.",
        facts: [
          ["Role", "XR developer"],
          ["Period", "Sept 2025 – Mar 2026"],
          ["Setting", "Final-year engineering project"],
        ],
        sections: [
          {
            title: "What I did",
            lines: [
              "Rebuilt from scratch the digital twin of Alten's offices and laboratory with Godot and OpenXR, a demonstrator used to sell this offer to clients.",
              "Built five modes matched to the device's performance: 2D, 3D, explorable and interactive 3D, VR (controllers or hand tracking) and a mixed-reality prototype with spatial anchors.",
              "Modelled the laboratory in Blender, integrated real-time ROS sensors as a pair, and worked in Agile with Azure DevOps.",
            ],
          },
        ],
        linkLabels: [],
      },
      fil: {
        tagline: "Proyekto sa huling taon: isang interactive na digital twin ng mga lab ng Alten, na maaaring galugarin sa VR at mixed reality.",
        facts: [
          ["Tungkulin", "XR developer"],
          ["Panahon", "Set. 2025 – Mar. 2026"],
          ["Konteksto", "Proyekto sa huling taon ng engineering"],
        ],
        sections: [
          {
            title: "Ang aking ginawa",
            lines: [
              "Buong binago ang digital twin ng mga opisina at laboratoryo ng Alten gamit ang Godot at OpenXR, isang demonstrator na ginagamit para ialok ang serbisyong ito sa mga kliyente.",
              "Bumuo ng limang mode na angkop sa kakayahan ng device: 2D, 3D, 3D na maaaring galugarin at interactive, VR (mga controller o hand tracking) at prototype ng mixed reality na may mga spatial anchor.",
              "Minodelo ang laboratoryo sa Blender, isinama nang may kapareha ang mga ROS sensor nang real time, at nagtrabaho sa Agile gamit ang Azure DevOps.",
            ],
          },
        ],
        linkLabels: [],
      },
    },
  },
  edf: {
    slug: "n7-consulting-edf",
    title: "Mission EDF",
    stack: ["Python", "Linux", "Modbus", "MQTT", "DTMF"],
    links: [],
    accent: "#ff7a3d",
    copy: {
      fr: {
        tagline: "Automatiser les tests de systèmes d'alarme industriels, via Modbus, MQTT et la téléphonie.",
        facts: [
          ["Rôle", "Développeur Python"],
          ["Période", "Oct. 2024 – mars 2025"],
          ["Cadre", "N7 Consulting, mission pour EDF"],
        ],
        sections: [
          {
            title: "Ce que j'ai fait",
            lines: [
              "Automatisation en Python sous Linux des tests d'une trentaine d'alarmes d'un système industriel, déclenchées via Modbus et MQTT.",
              "Automatisation des appels téléphoniques et de l'envoi de codes DTMF : suppression d'une procédure manuelle supervisée de 15 à 20 min par alarme.",
              "Mission menée seul et entièrement à distance depuis le Canada, avec des points réguliers avec l'équipe EDF de Toulouse.",
            ],
          },
        ],
        linkLabels: [],
      },
      en: {
        tagline: "Automating the tests of industrial alarm systems, over Modbus, MQTT and telephony.",
        facts: [
          ["Role", "Python developer"],
          ["Period", "Oct 2024 – Mar 2025"],
          ["Setting", "N7 Consulting, assignment for EDF"],
        ],
        sections: [
          {
            title: "What I did",
            lines: [
              "Automated, in Python on Linux, the tests of about thirty alarms of an industrial system, triggered over Modbus and MQTT.",
              "Automated the phone calls and the sending of DTMF codes, removing a supervised manual procedure of 15 to 20 minutes per alarm.",
              "Carried out alone and fully remotely from Canada, with regular check-ins with the EDF team in Toulouse.",
            ],
          },
        ],
        linkLabels: [],
      },
      fil: {
        tagline: "Pag-automate ng mga test ng mga industrial na alarm system, gamit ang Modbus, MQTT at telepono.",
        facts: [
          ["Tungkulin", "Python developer"],
          ["Panahon", "Okt. 2024 – Mar. 2025"],
          ["Konteksto", "N7 Consulting, proyekto para sa EDF"],
        ],
        sections: [
          {
            title: "Ang aking ginawa",
            lines: [
              "In-automate gamit ang Python sa Linux ang mga test ng humigit-kumulang tatlumpung alarm ng isang industrial na system, na pinapagana sa pamamagitan ng Modbus at MQTT.",
              "In-automate ang mga tawag sa telepono at ang pagpapadala ng mga DTMF code: inalis ang isang mano-manong prosesong binabantayan na 15 hanggang 20 minuto kada alarm.",
              "Ginawa nang mag-isa at ganap na remote mula sa Canada, na may regular na pakikipag-usap sa team ng EDF sa Toulouse.",
            ],
          },
        ],
        linkLabels: [],
      },
    },
  },
  "groupe-fd": {
    slug: "groupe-fd-assurances",
    title: "Groupe FD Assurances",
    stack: ["Electron.js"],
    links: [],
    accent: "#c9a96e",
    copy: {
      fr: {
        tagline: "Semi-automatiser les tâches simples mais chronophages d'un cabinet de courtage en assurances.",
        facts: [
          ["Rôle", "Développeur logiciel"],
          ["Période", "Juin – juil. 2024"],
          ["Cadre", "Stage"],
        ],
        sections: [
          {
            title: "Ce que j'ai fait",
            lines: [
              "Conception d'une application de bureau Electron / Node.js qui numérise la gestion des dossiers clients et des devis : création, nommage, classement et recherche.",
              "Remplacement de la saisie, du renommage et du tri manuels : 10 à 15 min gagnées par dossier.",
            ],
          },
        ],
        linkLabels: [],
      },
      en: {
        tagline: "Semi-automating the simple but time-consuming tasks of an insurance brokerage.",
        facts: [
          ["Role", "Software developer"],
          ["Period", "Jun – Jul 2024"],
          ["Setting", "Internship"],
        ],
        sections: [
          {
            title: "What I did",
            lines: [
              "Designed an Electron / Node.js desktop app that digitises the handling of client files and quotes: creation, naming, filing and search.",
              "Replaced manual entry, renaming and sorting: 10 to 15 minutes saved per file.",
            ],
          },
        ],
        linkLabels: [],
      },
      fil: {
        tagline: "Bahagyang pag-automate ng mga simple pero matagal na gawain ng isang insurance brokerage.",
        facts: [
          ["Tungkulin", "Software developer"],
          ["Panahon", "Hun. – Hul. 2024"],
          ["Konteksto", "Internship"],
        ],
        sections: [
          {
            title: "Ang aking ginawa",
            lines: [
              "Dinisenyo ang isang Electron / Node.js desktop app na nagdi-digitize ng pamamahala ng mga file ng kliyente at mga quote: paggawa, pagpapangalan, pag-aayos at paghahanap.",
              "Pinalitan ang mano-manong pag-type, pagpapalit ng pangalan at pag-uuri: 10 hanggang 15 minuto ang natitipid kada file.",
            ],
          },
        ],
        linkLabels: [],
      },
    },
  },
};

/** GNOME-style app window describing one project, opened from the dock. */
export function AppWindow({ app, onClose }: { app: DockAppId; onClose: () => void }) {
  const lang = useLanguage();
  const t = strings[lang];
  const content = APPS[app];
  const copy = content.copy[lang];
  const icon = DOCK_APPS.find((dockApp) => dockApp.id === app)!.icon;
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Runs once per opening: the desktop re-renders every second for its clock.
  useEffect(() => {
    closeRef.current?.focus();
    // Esc closes the window instead of leaving the screen.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return (
    <div
      role="dialog"
      aria-label={content.title}
      className="absolute z-10 flex flex-col overflow-hidden rounded-xl bg-[#242424] shadow-2xl ring-1 ring-white/10"
      style={{ top: BAR_PX + 24, bottom: 24, left: DOCK_PX + 24, right: 24, maxWidth: 820, marginInline: "auto" }}
    >
      {/* Header bar */}
      <header className="relative flex h-11 shrink-0 items-center justify-center bg-[#303030] px-3 text-[13px] font-semibold">
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" className="h-5 w-5" />
          {content.title}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline-white"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-7 select-text">
        <div className="mb-6 flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt={`${t.logo} ${content.title}`} className="h-20 w-20 shrink-0" />
          <div>
            <h2 className="text-[28px] leading-tight font-bold">{content.title}</h2>
            <p className="mt-1 text-[15px] text-white/75">{copy.tagline}</p>
          </div>
        </div>

        <dl className="mb-6 grid gap-3 sm:grid-cols-3">
          {copy.facts.map(([label, text]) => (
            <div key={label} className="rounded-lg bg-white/5 px-3 py-2.5">
              <dt className="text-[11px] font-semibold tracking-[0.12em] text-white/50 uppercase">{label}</dt>
              <dd className="mt-0.5 text-[13px] text-white/90">{text}</dd>
            </div>
          ))}
        </dl>

        <div className="mb-6 flex flex-wrap gap-2">
          {content.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full px-3 py-1 text-[12px] font-medium"
              style={{ color: content.accent, background: `color-mix(in srgb, ${content.accent} 15%, transparent)` }}
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="space-y-5">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-1.5 text-[11px] font-semibold tracking-[0.12em] text-white/50 uppercase">{section.title}</h3>
              {section.lines.length > 1 ? (
                <ul className="list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-white/85 marker:text-white/40">
                  {section.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] leading-relaxed text-white/85">{section.lines[0]}</p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3 text-[13px] font-medium">
          {content.links.map((href, i) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-4 py-2 text-[#1a1814] hover:brightness-110"
              style={{ background: content.accent }}
            >
              {copy.linkLabels[i]} ↗
            </a>
          ))}
          <Link href={`/projects/${content.slug}`} className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20">
            {t.caseStudy}
          </Link>
        </div>
      </div>
    </div>
  );
}
