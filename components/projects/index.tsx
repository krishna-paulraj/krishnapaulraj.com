"use client";

import Image from "next/image";
import Link from "next/link";

import HighlightedHeading from "@/components/highlighted-heading";
import TechStack from "@/components/projects/tech-stack";
import { PROJECTS, type Project } from "@/lib/projects";

function ProjectCard({
  project,
  views,
}: {
  project: Project;
  views?: number;
}) {
  const detailHref = `/projects/${project.slug}`;

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={detailHref}
        aria-label={`${project.name} — read more`}
        className="group block"
      >
        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          {project.image ? (
            <>
              <Image
                src={project.image}
                alt={project.name}
                width={600}
                height={338}
                className={`h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110 ${project.imageDark ? "dark:hidden" : ""}`}
              />
              {project.imageDark && (
                <Image
                  src={project.imageDark}
                  alt={project.name}
                  width={600}
                  height={338}
                  className="hidden h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110 dark:block"
                />
              )}
            </>
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
      </Link>

      <div>
        <p className="font-semibold text-foreground">
          <Link href={detailHref} className="hover:underline">
            {project.name}
          </Link>
        </p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
        {views !== undefined && views > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {views.toLocaleString()} {views === 1 ? "view" : "views"}
          </p>
        )}
      </div>

      {project.tech.length > 0 && <TechStack tech={project.tech} />}
    </div>
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

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            views={viewCounts?.[project.slug]}
          />
        ))}
      </div>
    </div>
  );
}
