import Image from "next/image";
import Link from "next/link";

import HighlightedHeading from "@/components/highlighted-heading";
import { PROJECTS, type Project, type ProjectTech } from "@/lib/projects";

function TechBadge({ icon: Icon, label, color }: ProjectTech) {
  return (
    <span
      title={label}
      className="flex size-6 items-center justify-center rounded-full border border-border bg-muted"
    >
      <Icon className="size-4" style={{ color }} />
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
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
            <Image
              src={project.image}
              alt={project.name}
              width={600}
              height={338}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            />
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
      </div>

      {project.tech.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.tech.map((t) => (
            <TechBadge key={t.label} {...t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectsSection({
  standalone = false,
}: {
  standalone?: boolean;
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
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
