import { NoteText } from "@/components/NoteText";
import { profile } from "@/data/profile";
import { resume, type ResumeEntry } from "@/data/resume";

/** Width over height of an A4 sheet. */
export const A4_ASPECT = 210 / 297;

/**
 * Off for now: the zoom stops on the sheet lying on the desk. Turn on to fade the readable CV from
 * src/data/resume.ts in over it.
 */
const SHOW_PAGE = false;

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
}: {
  active: boolean;
  onLeave: () => void;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${SHOW_PAGE ? "bg-ink/10" : ""}`}
      onClick={SHOW_PAGE ? onLeave : undefined}
    >
      {SHOW_PAGE && (
        <article
          aria-label="Resume"
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

          <Section title="Experience">
            {resume.experience.map((entry, i) => (
              <Entry key={i} entry={entry} />
            ))}
          </Section>
          <Section title="Education">
            {resume.education.map((entry, i) => (
              <Entry key={i} entry={entry} />
            ))}
          </Section>
          <Section title="Skills">
            <p>
              <NoteText note={resume.skills} />
            </p>
          </Section>
          <Section title="Languages">
            <p>
              <NoteText note={resume.languages} />
            </p>
          </Section>
        </article>
      )}

      <button
        type="button"
        onClick={onLeave}
        tabIndex={active ? 0 : -1}
        className="absolute right-5 bottom-5 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-black/45 focus-visible:outline-white"
      >
        ← Back to the room <span className="opacity-60">(Esc)</span>
      </button>
    </div>
  );
}
