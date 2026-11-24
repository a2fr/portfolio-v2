"use client";

import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { NoteText } from "@/components/NoteText";
import { StepRail } from "@/components/StepRail";
import type { Note } from "@/data/note";
import { steps, type StepId } from "@/data/process";
import { getProject, projects } from "@/data/projects";
import { type Lang, type Localized, useLanguage } from "@/i18n/language";
import { strings } from "@/i18n/strings";
import { useDocumentTitle } from "@/i18n/useDocumentTitle";

/** A project's case study, in the site's language. */
export function ProjectView({ slug }: { slug: string }) {
  const lang = useLanguage();
  const t = strings[lang];
  const project = getProject(slug)!;

  useDocumentTitle(`${project.title[lang]} | Alan Fresco`);
  const railSteps = useMemo(() => steps.map(({ id, name }) => ({ id, name: name[lang] })), [lang]);
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];

  const content: Record<StepId, ReactNode> = {
    understand: (
      <>
        <Block title={t.theProblem}>
          <NoteText note={project.understand.problem} />
        </Block>
        <Block title={t.constraints}>
          <NoteList notes={project.understand.constraints} />
        </Block>
      </>
    ),
    research: (
      <>
        <Block title={t.whatExisted}>
          <NoteText note={project.research.existing} />
        </Block>
        <Block title={t.optionsConsidered}>
          <ul className="border-b border-line">
            {project.research.options.map((option, i) => (
              <li
                key={i}
                className={`grid gap-x-8 gap-y-1 border-t border-line py-4 sm:grid-cols-[15rem_minmax(0,1fr)] ${
                  option.draft ? "text-cobalt" : ""
                }`}
              >
                <p className="font-medium">
                  <span className={option.verdict === "chosen" ? "marker text-ink" : "rejected"}>{local(option.name, lang)}</span>
                  <span className="sr-only">{option.verdict === "chosen" ? t.chosen : t.rejected}</span>
                </p>
                <p>{local(option.why, lang)}</p>
              </li>
            ))}
          </ul>
          {project.research.options.some((option) => option.draft) && (
            <p className="mt-3 text-sm text-cobalt">
              {t.draftOptions}
            </p>
          )}
        </Block>
      </>
    ),
    plan: (
      <>
        <Block title={t.theDecision}>
          <NoteText note={project.plan.decision} />
        </Block>
        <Block title={t.planRoles}>
          <NoteList notes={project.plan.steps} />
        </Block>
      </>
    ),
    build: (
      <>
        <Block title={t.whatIBuilt}>
          <NoteText note={project.build.summary} />
        </Block>
        <Block title={t.hardParts}>
          <NoteList notes={project.build.hardParts} />
        </Block>
      </>
    ),
    verify: (
      <>
        <Block title={t.howChecked}>
          <NoteList notes={project.verify.checks} />
        </Block>
        <Block title={t.outcome}>
          <NoteText note={project.verify.outcome} />
        </Block>
        <Block title={t.differently}>
          <NoteText note={project.verify.next} />
        </Block>
      </>
    ),
  };

  return (
    <article className="mx-auto max-w-6xl px-5 sm:px-8">
      <header className="pt-14 pb-12 sm:pt-20">
        <Link href="/#projects" className="text-sm text-soft underline-offset-4 hover:text-cobalt hover:underline">
          {t.allProjects}
        </Link>
        <h1 className="mt-4 max-w-[18ch] font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.03em]">
          {project.title[lang]}
        </h1>
        <p className="mt-6 max-w-[56ch] text-xl">{project.tagline[lang]}</p>
        <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-line pt-6 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4">
          <Fact term={t.role}>
            <NoteText note={project.role} />
          </Fact>
          <Fact term={t.period}>
            <NoteText note={project.period} />
          </Fact>
          <Fact term={t.team}>
            <NoteText note={project.team} />
          </Fact>
          <Fact term={t.tools}>{project.stack.join(", ")}</Fact>
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
                  {link.label[lang]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-x-10">
        <StepRail label={t.stepsNav} steps={railSteps} />
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
                {step.name[lang]}
              </h2>
              <div className="mt-8 flex max-w-[68ch] flex-col gap-10">{content[step.id]}</div>
            </section>
          ))}
        </div>
      </div>

      <nav aria-label={t.nextProject} className="border-t border-line pt-8">
        <p className="text-sm text-soft">{t.nextProject}</p>
        <Link
          href={`/projects/${next.slug}`}
          className="mt-1 inline-block font-display text-3xl font-semibold tracking-tight decoration-cobalt decoration-[3px] underline-offset-[6px] hover:underline sm:text-4xl"
        >
          {next.title[lang]}
        </Link>
      </nav>
    </article>
  );
}

const local = (text: string | Localized, lang: Lang) => (typeof text === "string" ? text : text[lang]);

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
      {notes.map((note, i) => (
        <li key={i}>
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
