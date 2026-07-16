import Link from "next/link";
import { TerminalIcon, WrenchIcon } from "lucide-react";

import HighlightedHeading from "@/components/ui/highlighted-heading";

const explore = [
  {
    href: "/terminal",
    icon: TerminalIcon,
    title: "Terminal",
    description: "My Zsh, Powerlevel10k, and tmux setup",
  },
  {
    href: "/gears",
    icon: WrenchIcon,
    title: "Gears",
    description: "Devices, software, and tools I use daily",
  },
];

export function ExploreSection({
  headingLevel: Heading = "h2",
}: {
  /**
   * Heading element for the section title. Defaults to h2 — the section is
   * embedded in the home page, which has its own h1.
   */
  headingLevel?: "h1" | "h2";
} = {}) {
  return (
    <div className="mt-5 w-full border-t pt-5">
      <Heading className="text-3xl font-bold tracking-tight">Explore</Heading>
      <HighlightedHeading className="my-4">
        A peek into my setup
      </HighlightedHeading>

      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {explore.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group border-border bg-card/40 hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-4 transition-colors"
          >
            <Icon className="text-muted-foreground mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-foreground text-sm font-semibold group-hover:underline">
                {title}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
