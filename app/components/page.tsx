import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import ComponentsSection from "@/components/sections/components-page/components-section";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Open-source UI components I built for this site, distributed via the shadcn registry.",
  alternates: { canonical: "/components" },
  robots: { index: false, follow: true },
};

export default function ComponentsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal>
        <ComponentsSection standalone />
      </Reveal>
    </div>
  );
}
