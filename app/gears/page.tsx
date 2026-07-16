import type { Metadata } from "next";
import { AppWindowIcon, LaptopIcon, PuzzleIcon } from "lucide-react";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Gears",
  description: "My gears and tools I use to get my work done.",
  alternates: { canonical: "/gears" },
};

const amazon = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

const DEVICES: { label: string; href: string }[] = [
  {
    label: "Apple MacBook M2 8GB 256GB",
    href: amazon("Apple MacBook M2"),
  },
  {
    label: "Apple iphone 13 (128 GB)",
    href: amazon("Apple iphone 13 (128 GB)"),
  },
  {
    label: "Apple Airpods Pro",
    href: amazon("Apple Airpods Pro"),
  },
  {
    label: "LG Ultrawide Ergo - 34Wn780 (34 Inch 86.72 Cm)",
    href: amazon("LG 34Wn780"),
  },
  {
    label: "Keychron K3 Pro Keyboard (Gateron Brown Switch)",
    href: "https://keychron.in/product/keychron-k3-pro-qmk-via-wireless-custom-mechanical-keyboard/",
  },
  {
    label: "Logitech Pebble Mouse",
    href: "https://www.logitech.com/en-in/shop/p/m350-pebble-wireless-mouse.910-006665",
  },
];

const SOFTWARE: { label: string; href: string }[] = [
  { label: "Zen", href: "https://zen-browser.app/" },
  { label: "Notion", href: "https://www.notion.so/" },
  { label: "Karabiner Elements", href: "https://karabiner-elements.pqrs.org/" },
  { label: "Cap So", href: "https://cap.so/" },
];

const Development: { label: string; href: string }[] = [
  { label: "Neovim", href: "https://neovim.io/" },
  { label: "iTerm2", href: "https://iterm2.com/" },
  { label: "Claude Code", href: "https://claude.ai/" },
  { label: "Zed", href: "https://zed.dev/" },
  { label: "Pencil", href: "https://www.pencil.dev/" },
];

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
      <span className="border-border bg-muted/40 text-muted-foreground flex size-7 items-center justify-center rounded-md border [&_svg]:size-3.5">
        {icon}
      </span>
      {title}
    </h2>
  );
}

function LinkItem({ label, href }: { label: string; href: string }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span
        aria-hidden="true"
        className="bg-muted-foreground/60 mt-2 inline-block size-1 shrink-0 rounded-full"
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground decoration-foreground/30 underline-offset-2 hover:underline"
      >
        {label}
      </a>
    </li>
  );
}

export default function GearsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-3 py-6 font-sans md:px-6">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Gears</h1>
        <HighlightedHeading className="my-4">
          My gears and tools I use to get my work done
        </HighlightedHeading>
      </Reveal>

      <Reveal
        as="section"
        delay={0.1}
        className="border-border mt-10 border-t pt-8"
      >
        <SectionTitle icon={<LaptopIcon />} title="Devices & Accessories" />
        <ul className="mt-5 space-y-2">
          {DEVICES.map((d) => (
            <li key={d.label} className="flex items-start gap-2 text-sm">
              <span
                aria-hidden="true"
                className="bg-muted-foreground/60 mt-2 inline-block size-1 shrink-0 rounded-full"
              />
              <a
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground decoration-foreground/30 underline-offset-2 hover:underline"
              >
                {d.label}
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal
        as="section"
        delay={0.3}
        className="border-border mt-10 border-t pt-8"
      >
        <SectionTitle icon={<AppWindowIcon />} title="Software" />
        <ul className="mt-5 space-y-2">
          {SOFTWARE.map((s) => (
            <LinkItem key={s.label} label={s.label} href={s.href} />
          ))}
        </ul>
      </Reveal>

      <Reveal
        as="section"
        delay={0.2}
        className="border-border mt-10 border-t pt-8"
      >
        <SectionTitle icon={<PuzzleIcon />} title="Development" />
        <ul className="mt-5 space-y-2">
          {Development.map((dev) => (
            <LinkItem key={dev.label} label={dev.label} href={dev.href} />
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
