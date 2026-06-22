"use client";

import Link from "next/link";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import TechStack from "@/components/sections/projects/tech-stack";
import { PROJECTS, type Project, type ProjectStatus } from "@/lib/projects";

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
        <p className="font-semibold text-foreground group-hover:underline">
          {project.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          {project.tech.length > 0 && <TechStack tech={project.tech} />}
          {(project.status || viewCount > 0) && (
            <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
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
        <span className="shrink-0 text-sm text-muted-foreground">
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
      <HighlightedHeading className="my-4">
        I love building things
      </HighlightedHeading>

      <ul className="divide-y divide-border">
        {PROJECTS.map((project) => (
          <li key={project.slug}>
            <ProjectRow project={project} views={viewCounts?.[project.slug]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
