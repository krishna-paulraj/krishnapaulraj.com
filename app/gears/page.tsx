import type { Metadata } from "next";
import { AppWindowIcon, LaptopIcon, PuzzleIcon } from "lucide-react";

import HighlightedHeading from "@/components/highlighted-heading";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Gears",
  description: "My gears and tools I use to get my work done.",
};

const amazon = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

const DEVICES: { label: string; href: string }[] = [
  {
    label: 'Apple MacBook Pro 16" M4 48GB 512GB',
    href: "https://www.apple.com/shop/buy-mac/macbook-pro",
  },
  { label: "Samsung S23 (256 GB)", href: amazon("Samsung Galaxy S23 256GB") },
  {
    label: "LG Ultragear Monitor 27GS65F (27 inch, 68.5 cm)",
    href: amazon("LG 27GS65F"),
  },
  {
    label: "LG Curved Ultra Wide Monitor 34WR50QK (34 inch, 86.36 cm)",
    href: amazon("LG 34WR50QK"),
  },
  {
    label: "Monitor Stand with Laptop",
    href: amazon("monitor stand with laptop shelf"),
  },
  {
    label: "Magic Keyboard",
    href: "https://www.apple.com/shop/buy-mac/mac-accessories/keyboards",
  },
  {
    label: "Logitech MX Master 3S Mouse",
    href: "https://www.logitech.com/en-us/shop/p/mx-master-3s",
  },
  { label: "Mouse Pad", href: amazon("large desk mouse pad") },
  { label: "FIFINE K688 Podcast Microphone", href: amazon("FIFINE K688") },
  {
    label: "Crossbeats Roar 2.0 (Special Edition)",
    href: amazon("Crossbeats Roar 2.0"),
  },
  {
    label: "Smart LED Light Strip (Tapo L900-5)",
    href: "https://www.tp-link.com/us/home-networking/smart-bulb/tapo-l900-5/",
  },
  {
    label: "DIGITEK Lite (DCL-150WBC Combo)",
    href: amazon("DIGITEK DCL-150WBC"),
  },
  { label: "Godox Softbox SB-GUE80", href: amazon("Godox SB-GUE80") },
  { label: "Boom Arm Holder for Light", href: amazon("boom arm light stand") },
  {
    label: "Samsung T7 2TB SSD",
    href: "https://www.samsung.com/us/computing/memory-storage/portable-solid-state-drives/portable-ssd-t7-usb-3-2-2tb-titan-gray-mu-pc2t0t-am/",
  },
];

const EXTENSIONS: { label: string; href: string }[] = [
  { label: "Unhook", href: "https://unhook.app/" },
  { label: "uBlock Origin", href: "https://ublockorigin.com/" },
  {
    label: "React Developer Tools",
    href: "https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi",
  },
  { label: "daily.dev", href: "https://daily.dev/" },
  { label: "Grammarly", href: "https://www.grammarly.com/" },
  { label: "Wappalyzer", href: "https://www.wappalyzer.com/" },
  { label: "ColorZilla", href: "https://www.colorzilla.com/" },
];

const SOFTWARE: { label: string; href: string }[] = [
  { label: "Dia", href: "https://www.diabrowser.com/" },
  { label: "Notion", href: "https://www.notion.so/" },
  { label: "TickTick", href: "https://ticktick.com/" },
  { label: "OBS Studio", href: "https://obsproject.com/" },
  { label: "VLC", href: "https://www.videolan.org/vlc/" },
  { label: "Ghostty", href: "https://ghostty.org/" },
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
      <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground [&_svg]:size-3.5">
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
        className="mt-2 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/60"
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
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 font-sans">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Gears</h1>
        <HighlightedHeading className="my-4">
          My gears and tools I use to get my work done
        </HighlightedHeading>
      </Reveal>

      <Reveal
        as="section"
        delay={0.1}
        className="mt-10 border-t border-border pt-8"
      >
        <SectionTitle icon={<LaptopIcon />} title="Devices & Accessories" />
        <ul className="mt-5 space-y-2">
          {DEVICES.map((d) => (
            <li key={d.label} className="flex items-start gap-2 text-sm">
              <span
                aria-hidden="true"
                className="mt-2 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/60"
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
        delay={0.2}
        className="mt-10 border-t border-border pt-8"
      >
        <SectionTitle icon={<PuzzleIcon />} title="Web Extensions" />
        <ul className="mt-5 space-y-2">
          {EXTENSIONS.map((ext) => (
            <LinkItem key={ext.label} label={ext.label} href={ext.href} />
          ))}
        </ul>
      </Reveal>

      <Reveal
        as="section"
        delay={0.3}
        className="mt-10 border-t border-border pt-8"
      >
        <SectionTitle icon={<AppWindowIcon />} title="Software" />
        <ul className="mt-5 space-y-2">
          {SOFTWARE.map((s) => (
            <LinkItem key={s.label} label={s.label} href={s.href} />
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
