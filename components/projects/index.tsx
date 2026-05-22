import Image from "next/image";
import type { StaticImageData } from "next/image";
import HighlightedHeading from "@/components/highlighted-heading";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiVuedotjs,
  SiNuxt,
  SiHtml5,
  SiCss,
  SiTypescript,
  SiNodedotjs,
  SiPrisma,
  SiSupabase,
  SiStripe,
  SiFirebase,
} from "react-icons/si";

type TechIcon = {
  icon: React.ElementType;
  label: string;
  color?: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  image?: StaticImageData | string;
  href?: string;
  tech: TechIcon[];
};

const TECH: Record<string, TechIcon> = {
  react: { icon: SiReact, label: "React", color: "#61DAFB" },
  next: { icon: SiNextdotjs, label: "Next.js", color: "currentColor" },
  tailwind: { icon: SiTailwindcss, label: "Tailwind", color: "#38BDF8" },
  vue: { icon: SiVuedotjs, label: "Vue", color: "#4FC08D" },
  nuxt: { icon: SiNuxt, label: "Nuxt", color: "#00DC82" },
  html: { icon: SiHtml5, label: "HTML5", color: "#E34F26" },
  css: { icon: SiCss, label: "CSS3", color: "#1572B6" },
  typescript: { icon: SiTypescript, label: "TypeScript", color: "#3178C6" },
  node: { icon: SiNodedotjs, label: "Node.js", color: "#5FA04E" },
  prisma: { icon: SiPrisma, label: "Prisma", color: "currentColor" },
  supabase: { icon: SiSupabase, label: "Supabase", color: "#3FCF8E" },
  stripe: { icon: SiStripe, label: "Stripe", color: "#635BFF" },
  firebase: { icon: SiFirebase, label: "Firebase", color: "#FFCA28" },
};

const PROJECTS: Project[] = [
  {
    id: "krishnapaulraj-com",
    name: "krishnapaulraj.com",
    description:
      "My personal portfolio showcasing work, writing, and projects.",
    href: "https://krishnapaulraj.com",
    tech: [TECH.next, TECH.tailwind, TECH.typescript],
  },
  {
    id: "krishnapaulraj-com2",
    name: "krishnapaulraj.com",
    description:
      "My personal portfolio showcasing work, writing, and projects.",
    href: "https://krishnapaulraj.com",
    tech: [TECH.next, TECH.tailwind, TECH.typescript],
  },
  {
    id: "krishnapaulraj-com3",
    name: "krishnapaulraj.com",
    description:
      "My personal portfolio showcasing work, writing, and projects.",
    href: "https://krishnapaulraj.com",
    tech: [TECH.next, TECH.tailwind, TECH.typescript],
  },
];

function TechBadge({ icon: Icon, label, color }: TechIcon) {
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
  const thumbnail = (
    <div className="group overflow-hidden rounded-lg border border-border bg-muted aspect-video">
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
  );

  return (
    <div className="flex flex-col gap-3">
      {project.href ? (
        <a href={project.href} target="_blank" rel="noopener noreferrer">
          {thumbnail}
        </a>
      ) : (
        thumbnail
      )}

      <div>
        <p className="font-semibold text-foreground">{project.name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {project.tech.map((t) => (
          <TechBadge key={t.label} {...t} />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  if (PROJECTS.length === 0) return null;

  return (
    <div className="mt-5 w-full border-t pt-5">
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      <HighlightedHeading className="my-4">
        I love building things
      </HighlightedHeading>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
