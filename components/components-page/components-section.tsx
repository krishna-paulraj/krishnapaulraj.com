import HighlightedHeading from "@/components/highlighted-heading";

import { ComponentCard } from "./component-card";
import { COMPONENTS } from "./components-list";

export default function ComponentsSection({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  if (COMPONENTS.length === 0) return null;

  return (
    <div className={standalone ? "w-full" : "mt-5 w-full border-t pt-5"}>
      <h1 className="text-3xl font-bold tracking-tight">Components</h1>
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
