import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { NoteText } from "@/components/NoteText";
import { StepRail } from "@/components/StepRail";
import type { Note } from "@/data/note";
import { steps, type StepId } from "@/data/process";
import { getProject, projects } from "@/data/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.tagline };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  const content: Record<StepId, ReactNode> = {
    understand: (
      <>
        <Block title="The problem">
          <NoteText note={project.understand.problem} />
        </Block>
        <Block title="Constraints">
          <NoteList notes={project.understand.constraints} />
        </Block>
      </>
    ),
    research: (
      <>
        <Block title="What already existed">
          <NoteText note={project.research.existing} />
        </Block>
        <Block title="Options considered">
          <ul className="border-b border-line">
            {project.research.options.map((option) => (
              <li
                key={option.name}
                className={`grid gap-x-8 gap-y-1 border-t border-line py-4 sm:grid-cols-[15rem_minmax(0,1fr)] ${
                  option.draft ? "text-cobalt" : ""
                }`}
              >
                <p className="font-medium">
                  <span className={option.verdict === "chosen" ? "marker text-ink" : "rejected"}>{option.name}</span>
                  <span className="sr-only">{option.verdict === "chosen" ? " (chosen)" : " (rejected)"}</span>
                </p>
                <p>{option.why}</p>
              </li>
            ))}
          </ul>
          {project.research.options.some((option) => option.draft) && (
            <p className="mt-3 text-sm text-cobalt">
              To write: replace these three rows with the real options. Rejected ones stay struck through, the
              chosen one stays highlighted.
            </p>
          )}
        </Block>
      </>
    ),
    plan: (
      <>
        <Block title="The decision">
          <NoteText note={project.plan.decision} />
        </Block>
        <Block title="Plan, roles and communication">
          <NoteList notes={project.plan.steps} />
        </Block>
      </>
    ),
    build: (
      <>
        <Block title="What I built">
          <NoteText note={project.build.summary} />
        </Block>
        <Block title="Hard parts">
          <NoteList notes={project.build.hardParts} />
        </Block>
      </>
    ),
    verify: (
      <>
        <Block title="How it was checked">
          <NoteList notes={project.verify.checks} />
        </Block>
        <Block title="Outcome">
          <NoteText note={project.verify.outcome} />
        </Block>
        <Block title="What I would do differently">
          <NoteText note={project.verify.next} />
        </Block>
      </>
    ),
  };

  return (
    <article className="mx-auto max-w-6xl px-5 sm:px-8">
      <header className="pt-14 pb-12 sm:pt-20">
        <Link href="/#projects" className="text-sm text-soft underline-offset-4 hover:text-cobalt hover:underline">
          All projects
        </Link>
        <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.03em]">
          {project.title}
        </h1>
        <p className="mt-6 max-w-[56ch] text-xl">{project.tagline}</p>
        <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-line pt-6 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4">
          <Fact term="Role">
            <NoteText note={project.role} />
          </Fact>
          <Fact term="Period">
            <NoteText note={project.period} />
          </Fact>
          <Fact term="Team">
            <NoteText note={project.team} />
          </Fact>
          <Fact term="Tools">{project.stack.join(", ")}</Fact>
        </dl>
        {project.links.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {project.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline decoration-cobalt decoration-2 underline-offset-4 hover:text-cobalt"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-x-10">
        <StepRail steps={steps.map(({ id, name }) => ({ id, name }))} />
        <div>
          {steps.map((step, i) => (
            <section
              key={step.id}
              id={step.id}
              aria-labelledby={`${step.id}-title`}
              className="scroll-mt-20 border-t border-ink/50 pt-8 pb-16 lg:scroll-mt-8"
            >
              <h2 id={`${step.id}-title`} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="mr-3 text-soft">{i + 1}</span>
                {step.name}
              </h2>
              <div className="mt-8 flex max-w-[68ch] flex-col gap-10">{content[step.id]}</div>
            </section>
          ))}
        </div>
      </div>

      <nav aria-label="Next project" className="border-t border-line pt-8">
        <p className="text-sm text-soft">Next project</p>
        <Link
          href={`/projects/${next.slug}`}
          className="mt-1 inline-block font-display text-3xl font-semibold tracking-tight decoration-cobalt decoration-[3px] underline-offset-[6px] hover:underline sm:text-4xl"
        >
          {next.title}
        </Link>
      </nav>
    </article>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-display text-lg font-semibold">{title}</h3>
      <div className="text-[1.0625rem] leading-relaxed">{children}</div>
    </div>
  );
}

function NoteList({ notes }: { notes: Note[] }) {
  return (
    <ul className="flex flex-col items-start gap-2.5">
      {notes.map((note) => (
        <li key={note.text}>
          <NoteText note={note} />
        </li>
      ))}
    </ul>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-soft">{term}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
