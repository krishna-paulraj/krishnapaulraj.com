import NowPlaying from "@/components/NowPlaying";
import WorkExperienceComponent from "@/components/work/index";
import ProjectsSection from "@/components/projects/index";
import BlogSection from "@/components/blog";
import CopyText from "@/components/copy-text";
import { Reveal } from "@/components/motion/reveal";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-6 font-sans">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight">
          Suresh-Krishna Paulraj
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
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <a
            href="mailto:krishnapaulraj2004@gmail.com"
            className="text-foreground hover:underline underline-offset-4"
          >
            krishnapaulraj2004@gmail.com
          </a>
          <CopyText value="krishnapaulraj2004@gmail.com" label="email" />
        </p>
      </Reveal>

      <Reveal
        delay={0.08}
        className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed"
      >
        <p>
          Web developer passionate about building scalable, user-friendly
          applications with clean and efficient code. I focus on creating
          intuitive solutions that deliver real value.
        </p>
        <p>
          Experienced with{" "}
          <span className="text-foreground">
            Next.js, React, and TypeScript
          </span>
          . I enjoy experimenting with new technologies, solving challenging
          problems, and turning ideas into impactful projects.
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
