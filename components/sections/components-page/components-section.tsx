import HighlightedHeading from "@/components/ui/highlighted-heading";

import { ComponentCard } from "./component-card";
import { COMPONENTS } from "./components-list";

export default function ComponentsSection({
  standalone = false,
  headingLevel,
}: {
  standalone?: boolean;
  /**
   * Heading element for the section title. Defaults to h1 when the section
   * is the page heading (standalone on /components), h2 when embedded.
   */
  headingLevel?: "h1" | "h2";
}) {
  if (COMPONENTS.length === 0) return null;

  const Heading = headingLevel ?? (standalone ? "h1" : "h2");

  return (
    <div className={standalone ? "w-full" : "mt-5 w-full border-t pt-5"}>
      <Heading className="text-3xl font-bold tracking-tight">
        Components
      </Heading>
      <HighlightedHeading className="my-4">
        Open-source components I built for this site
      </HighlightedHeading>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COMPONENTS.map((c) => (
          <ComponentCard key={c.slug} {...c} />
        ))}
      </div>
    </div>
  );
}
