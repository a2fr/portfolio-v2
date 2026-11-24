import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { requestLanguage } from "@/i18n/server";
import { ProjectView } from "./ProjectView";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const lang = await requestLanguage();
  return { title: project.title[lang], description: project.tagline[lang] };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return <ProjectView slug={slug} />;
}
