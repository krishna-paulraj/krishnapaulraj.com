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
  STATUS_DOT,
  STATUS_LABEL,
  getProjectBySlug,
  getProjectSlugs,
  type ProjectLink,
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
    <article className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
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
              className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
            >
              {project.name}
            </a>
          ) : (
            project.name
          )}
        </h1>
        {project.description && (
          <p className="text-muted-foreground mt-3 leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
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
          className="border-border bg-muted mt-8 overflow-hidden rounded-lg border"
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
          className="border-border mt-12 border-t pt-8"
          aria-label="Highlights"
        >
          <h2 className="text-lg font-semibold tracking-tight">Highlights</h2>
          <ul className="mt-4 space-y-2">
            {project.highlights.map((h) => (
              <li
                key={h}
                className="text-muted-foreground flex items-start gap-2 text-sm"
              >
                <span
                  aria-hidden="true"
                  className="bg-muted-foreground/60 mt-2 inline-block size-1 shrink-0 rounded-full"
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
          className="border-border mt-12 border-t pt-8"
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
          className="border-border mt-12 border-t pt-8"
          aria-label="Project navigation"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/projects/${prev.slug}`}
                className="group border-border bg-card/40 hover:bg-muted/40 flex flex-col gap-1 rounded-lg border p-4 transition-colors"
              >
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <ChevronLeft className="size-3" />
                  Previous project
                </span>
                <span className="text-foreground text-sm font-medium group-hover:underline">
                  {prev.name}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="hidden sm:block" />
            )}
            {next ? (
              <Link
                href={`/projects/${next.slug}`}
                className="group border-border bg-card/40 hover:bg-muted/40 flex flex-col items-end gap-1 rounded-lg border p-4 text-right transition-colors"
              >
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  Next project
                  <ChevronRight className="size-3" />
                </span>
                <span className="text-foreground text-sm font-medium group-hover:underline">
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
