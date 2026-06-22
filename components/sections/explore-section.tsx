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

export function ExploreSection() {
  return (
    <div className="mt-5 w-full border-t pt-5">
      <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
      <HighlightedHeading className="my-4">
        A peek into my setup
      </HighlightedHeading>

      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {explore.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 transition-colors hover:bg-muted/40"
          >
            <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:underline">
                {title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
