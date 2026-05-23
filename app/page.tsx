import NowPlaying from "@/components/NowPlaying";
import WorkExperienceComponent from "@/components/work/index";
import ProjectsSection from "@/components/projects/index";
import BlogSection from "@/components/blog";
import { CopyButton } from "@/components/copy-button";
import { Reveal } from "@/components/motion/reveal";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight">
          Suresh Krishna Paulraj
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Software Engineer at{" "}
          <a
            href="https://blocsys.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Blocsys
          </a>
        </p>
        <p className="mt-2 flex items-center text-sm text-muted-foreground">
          <a
            href="mailto:krishnapaulraj2004@gmail.com"
            className="text-foreground hover:underline underline-offset-4"
          >
            krishnapaulraj2004@gmail.com
          </a>
          <CopyButton
            text="krishnapaulraj2004@gmail.com"
            variant="ghost"
            size="icon-xs"
            aria-label="Copy email"
          />
        </p>
      </Reveal>

      <Reveal
        delay={0.08}
        className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed"
      >
        <p>
          Web developer passionate about building scalable, user-friendly
          applications with clean and efficient code. I focus on crafting
          intuitive solutions that deliver real value.
        </p>
        <p>
          I enjoy exploring new technologies, tackling complex problems, and
          transforming ideas into meaningful, impactful projects.
        </p>
      </Reveal>

      <Reveal delay={0.16} className="mt-6">
        <NowPlaying />
      </Reveal>
      <Reveal delay={0.24}>
        <ProjectsSection />
      </Reveal>
      <Reveal delay={0.32}>
        <WorkExperienceComponent />
      </Reveal>
      <Reveal delay={0.4}>
        <BlogSection />
      </Reveal>
    </div>
  );
}
