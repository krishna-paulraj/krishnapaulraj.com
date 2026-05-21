import NowPlaying from "@/components/NowPlaying";
import WorkExperienceComponent from "@/components/work/index";
import BlogSection from "@/components/blog";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 font-sans">
      <h1 className="text-2xl font-semibold tracking-tight">
        Suresh-Krishna Paulraj
      </h1>
      <p className="mt-1 text-muted-foreground">Developer</p>
      <p className="text-muted-foreground">
        Making the web slightly more interesting
      </p>
      <div className="mt-6">
        <NowPlaying />
      </div>
      <WorkExperienceComponent />
      <BlogSection />
    </div>
  );
}
