"use client";

import { NoteText } from "@/components/NoteText";
import { useT } from "@/i18n/useT";
import { profile } from "@/data/profile";
import { resume, type ResumeEntry } from "@/data/resume";

/** Width over height of an A4 sheet. */
export const A4_ASPECT = 210 / 297;

/**
 * Off for now: the zoom stops on the sheet lying on the desk. Turn on to fade the readable CV from
 * src/data/resume.ts in over it.
 */
const SHOW_PAGE = false;

/** The CV the USB key on the desk hands over, and the name it is saved under. */
export const RESUME_PDF = { href: "/cv/Alan_Fresco_CV.pdf", fileName: "Alan_Fresco_CV.pdf" };

/** Asks the browser to save the CV PDF on the visitor's computer. */
export function saveResume() {
  const link = document.createElement("a");
  link.href = RESUME_PDF.href;
  link.download = RESUME_PDF.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-ink/80 pb-1 font-display text-xs font-semibold tracking-[0.14em] uppercase">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm">{children}</div>
    </section>
  );
}

function Entry({ entry }: { entry: ResumeEntry }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-medium">
          <NoteText note={entry.title} /> · <NoteText note={entry.place} />
        </p>
        <p className="text-soft">
          <NoteText note={entry.period} />
        </p>
      </div>
      <p className="mt-1 text-soft">
        <NoteText note={entry.detail} />
      </p>
    </div>
  );
}

/** The CV on the desk, shown as a sheet of A4 once the camera has come down onto the paper. */
export function ResumePaper({
  active,
  onLeave,
  usbGuide = false,
  compact = false,
}: {
  active: boolean;
  onLeave: () => void;
  /** The gold label beside the USB key is drawn: the link below then only shows up for the keyboard. */
  usbGuide?: boolean;
  /** A phone or a tablet: the sheet is too small to read, so the way to read it is to open the PDF itself. */
  compact?: boolean;
}) {
  const t = useT();
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${SHOW_PAGE ? `bg-ink/10 ${active ? "pointer-events-auto" : ""}` : ""}`}
      onClick={SHOW_PAGE ? onLeave : undefined}
    >
      {SHOW_PAGE && (
        <article
          aria-label={t.resume}
          onClick={(event) => event.stopPropagation()}
          className="max-h-[92%] overflow-y-auto bg-[#fbfaf6] px-[7%] py-[6%] text-ink shadow-2xl"
          style={{
            width: `min(92vw, calc(92vh * ${A4_ASPECT}))`,
            aspectRatio: `${A4_ASPECT}`,
          }}
        >
          <header>
            <h1 className="font-display text-3xl font-semibold">
              {profile.name}
            </h1>
            <p className="mt-1 text-soft">{profile.role}</p>
            <p className="mt-3 text-sm">
              <NoteText note={resume.headline} />
            </p>
            <p className="mt-2 text-sm text-soft">
              <NoteText note={resume.contact} />
            </p>
          </header>

          <Section title={t.experience}>
            {resume.experience.map((entry, i) => (
              <Entry key={i} entry={entry} />
            ))}
          </Section>
          <Section title={t.education}>
            {resume.education.map((entry, i) => (
              <Entry key={i} entry={entry} />
            ))}
          </Section>
          <Section title={t.skills}>
            <p>
              <NoteText note={resume.skills} />
            </p>
          </Section>
          <Section title={t.languages}>
            <p>
              <NoteText note={resume.languages} />
            </p>
          </Section>
        </article>
      )}

      {/* On a phone the sheet's text is a few pixels tall: the PDF opens in the phone's own viewer, which zooms. */}
      {compact && (
        <a
          href={RESUME_PDF.href}
          target="_blank"
          rel="noreferrer"
          tabIndex={active ? 0 : -1}
          className={`${active ? "pointer-events-auto" : ""} absolute bottom-6 left-1/2 flex min-h-11 -translate-x-1/2 items-center rounded-full bg-white/90 px-5 text-sm font-medium whitespace-nowrap text-ink shadow-lg backdrop-blur active:bg-white focus-visible:outline-white`}
        >
          {t.openCv} ↗
        </a>
      )}

      {/* The same as clicking the USB key, for the keyboard and for screens too narrow to show the key. */}
      <a
        href={RESUME_PDF.href}
        download={RESUME_PDF.fileName}
        tabIndex={active && !usbGuide && !compact ? 0 : -1}
        aria-hidden={usbGuide || compact}
        className={`${usbGuide || compact ? "hidden" : ""} ${active ? "pointer-events-auto" : ""} absolute bottom-5 left-5 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-black/45 focus-visible:outline-white`}
      >
        {t.saveCv}
      </a>

      <button
        type="button"
        onClick={onLeave}
        tabIndex={active ? 0 : -1}
        className={`${active ? "pointer-events-auto" : ""} absolute top-5 left-5 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-black/45 focus-visible:outline-white`}
      >
        ← {t.backToRoom} <span className="opacity-60 [@media(hover:none)]:hidden">(Esc)</span>
      </button>
    </div>
  );
}
