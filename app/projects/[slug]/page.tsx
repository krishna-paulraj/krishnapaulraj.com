import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRightIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLinkIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";

import { ACTION_BUTTON_CLASS } from "@/constants";
import { Reveal } from "@/components/motion/reveal";
import ShareButtons from "@/components/sections/blog/share-buttons";
import TechStack from "@/components/sections/projects/tech-stack";
import { GitHubStars } from "@/components/ui/github-stars";
import Views from "@/components/ui/views";
import { extractGitHubRepo, getGitHubStars } from "@/lib/github";
import { SITE_URL } from "@/lib/constants";
import { renderMarkdown } from "@/lib/markdown";
import {
  PROJECTS,
  getProjectBySlug,
  getProjectSlugs,
  type ProjectLink,
  type ProjectStatus,
} from "@/lib/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      title: project.name,
      description: project.description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: project.name,
      description: project.description,
    },
  };
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  archived: "Archived",
};

const STATUS_DOT: Record<ProjectStatus, string> = {
  live: "bg-emerald-500",
  "in-progress": "bg-amber-500",
  archived: "bg-zinc-500",
};

function LinkButton({ link }: { link: ProjectLink }) {
  const isInternal = link.href.startsWith("/");
  const className = ACTION_BUTTON_CLASS;

  const icon =
    link.type === "source" ? (
      <FaGithub className="size-4" />
    ) : link.type === "live" ? (
      <ArrowUpRightIcon className="size-4" />
    ) : (
      <ExternalLinkIcon className="size-4" />
    );

  if (isInternal) {
    return (
      <Link href={link.href} className={className}>
        {icon}
        {link.label}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {icon}
      {link.label}
    </a>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const html = project.longDescription
    ? await renderMarkdown(project.longDescription)
    : null;

  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  const next = idx > 0 ? PROJECTS[idx - 1] : null;
  const prev = idx >= 0 && idx < PROJECTS.length - 1 ? PROJECTS[idx + 1] : null;

  const sourceLink = project.links?.find((l) => l.type === "source");
  const githubRepo = sourceLink ? extractGitHubRepo(sourceLink.href) : null;
  const stars = githubRepo ? await getGitHubStars(githubRepo) : null;
  const titleLink =
    project.links?.find((l) => l.type === "live") ?? sourceLink ?? null;

  return (
    <article className="mx-auto w-full max-w-2xl flex-1 px-3 md:px-6 py-6 font-sans">
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to projects
          </Link>
          <ShareButtons
            title={project.name}
            url={`${SITE_URL}/projects/${project.slug}`}
          />
        </div>
      </Reveal>

      <Reveal as="header" delay={0.08} className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-pretty md:text-balance">
          {titleLink ? (
            <a
              href={titleLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline underline-offset-4"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h1>
        {project.description && (
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          {project.year && <span>{project.year}</span>}
          {project.year && project.status && <span aria-hidden="true">·</span>}
          {project.status && (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`inline-block size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
              />
              {STATUS_LABEL[project.status]}
            </span>
          )}
          {githubRepo && stars !== null && (
            <>
              <span aria-hidden="true">·</span>
              <GitHubStars repo={githubRepo} stargazersCount={stars} />
            </>
          )}
          <Views endpoint={`/api/projects/${project.slug}/views`} />
        </div>

        {project.tech.length > 0 && (
          <div className="mt-4">
            <TechStack tech={project.tech} />
          </div>
        )}
      </Reveal>

      {project.image && (
        <Reveal
          delay={0.16}
          className="mt-8 overflow-hidden rounded-lg border border-border bg-muted"
        >
          <Image
            src={project.image}
            alt={project.name}
            width={1280}
            height={720}
            className={`h-auto w-full object-cover ${project.imageDark ? "dark:hidden" : ""}`}
          />
          {project.imageDark && (
            <Image
              src={project.imageDark}
              alt={project.name}
              width={1280}
              height={720}
              className="hidden h-auto w-full object-cover dark:block"
            />
          )}
        </Reveal>
      )}

      {html && (
        <Reveal
          delay={0.24}
          className="prose prose-ncdai dark:prose-invert mt-10 max-w-none"
        >
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Reveal>
      )}

      {project.highlights && project.highlights.length > 0 && (
        <Reveal
          as="section"
          delay={0.28}
          className="mt-12 border-t border-border pt-8"
          aria-label="Highlights"
        >
          <h2 className="text-lg font-semibold tracking-tight">Highlights</h2>
          <ul className="mt-4 space-y-2">
            {project.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/60"
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {project.links && project.links.length > 0 && (
        <Reveal
          as="section"
          delay={0.3}
          className="mt-12 border-t border-border pt-8"
          aria-label="Links"
        >
          <h2 className="text-lg font-semibold tracking-tight">Links</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.links.map((link) => (
              <LinkButton key={link.href} link={link} />
            ))}
          </div>
        </Reveal>
      )}

      {(prev || next) && (
        <Reveal
          as="section"
          delay={0.34}
          className="mt-12 border-t border-border pt-8"
          aria-label="Project navigation"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/projects/${prev.slug}`}
                className="group flex flex-col gap-1 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronLeft className="size-3" />
                  Previous project
                </span>
                <span className="text-sm font-medium text-foreground group-hover:underline">
                  {prev.name}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={`/projects/${next.slug}`}
                className="group flex flex-col items-end gap-1 rounded-lg border border-border bg-card/40 p-4 text-right transition-colors hover:bg-muted/40"
              >
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  Next project
                  <ChevronRight className="size-3" />
                </span>
                <span className="text-sm font-medium text-foreground group-hover:underline">
                  {next.name}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
          </div>
        </Reveal>
      )}
    </article>
  );
}
