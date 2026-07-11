import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { SpotlightLogo } from "@/components/spotlight-logo";
import { ProfileHeader } from "@/components/sections/profile-header";
import { SocialLinks } from "@/components/sections/social-links";
import { Bio } from "@/components/sections/bio";
import NowPlaying from "@/components/sections/NowPlaying";
import ProjectsSection from "@/components/sections/projects/index";
import WorkExperienceComponent from "@/components/sections/work/index";
import BlogSection from "@/components/sections/blog";
import ComponentsSection from "@/components/sections/components-page/components-section";
import { ExploreSection } from "@/components/sections/explore-section";
import { Metrics01 } from "@/components/sections/metrics-01";
import ClosingNote from "@/components/sections/closing-note";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default function Home() {
  return (
    <>
      <div className="mx-auto w-full max-w-2xl flex-1 px-3 pb-6 font-sans md:px-6">
        <Reveal className="mx-auto mt-4 mb-8 w-full max-w-md">
          <SpotlightLogo />
        </Reveal>
        <Reveal>
          <ProfileHeader />
        </Reveal>
        <Reveal delay={0.08} className="mt-4">
          <SocialLinks />
        </Reveal>
        <Reveal
          delay={0.12}
          className="text-muted-foreground mt-4 space-y-2 text-sm leading-relaxed"
        >
          <Bio />
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
        <Reveal delay={0.44}>
          <ComponentsSection />
        </Reveal>
        <Reveal delay={0.52}>
          <ExploreSection />
        </Reveal>
      </div>
      <Metrics01 />
      <ClosingNote />
    </>
  );
}
