"use client";

import Link from "next/link";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import TechStack from "@/components/sections/projects/tech-stack";
import {
  PROJECTS,
  STATUS_DOT,
  STATUS_LABEL,
  type Project,
} from "@/lib/projects";
import { GithubActivity } from "../github-activity";

function ProjectRow({ project, views }: { project: Project; views?: number }) {
  const detailHref = `/projects/${project.slug}`;
  const viewCount = views ?? 0;

  return (
    <Link
      href={detailHref}
      aria-label={`${project.name} — read more`}
      className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
    >
      <div className="flex-1">
        <p className="text-foreground font-semibold group-hover:underline">
          {project.name}
        </p>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
          {project.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          {project.tech.length > 0 && <TechStack tech={project.tech} />}
          {(project.status || viewCount > 0) && (
            <div className="text-muted-foreground flex items-center gap-x-2 text-xs">
              {project.status && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className={`inline-block size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
                  />
                  {STATUS_LABEL[project.status]}
                </span>
              )}
              {project.status && viewCount > 0 && (
                <span aria-hidden="true">·</span>
              )}
              {viewCount > 0 && (
                <span>
                  {viewCount.toLocaleString()}{" "}
                  {viewCount === 1 ? "view" : "views"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {project.year && (
        <span className="text-muted-foreground shrink-0 text-sm">
          {project.year}
        </span>
      )}
    </Link>
  );
}

export default function ProjectsSection({
  standalone = false,
  viewCounts,
}: {
  standalone?: boolean;
  viewCounts?: Record<string, number>;
}) {
  if (PROJECTS.length === 0) return null;

  return (
    <div className={standalone ? "w-full" : "mt-5 w-full border-t pt-5"}>
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <HighlightedHeading className="mt-4">
        I love building things
      </HighlightedHeading>
      <GithubActivity />

      <ul className="divide-border divide-y">
        {PROJECTS.map((project) => (
          <li key={project.slug}>
            <ProjectRow project={project} views={viewCounts?.[project.slug]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
