import { MailIcon } from "lucide-react";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const socials = [
  {
    href: "https://x.com/thedevkrish",
    label: "X / Twitter",
    icon: FaXTwitter,
  },
  {
    href: "https://github.com/krishna-paulraj",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: "https://linkedin.com/in/suresh-krishna-paulraj",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    href: "https://instagram.com/krishnapaulraj",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    href: "mailto:krishnapaulraj2004@gmail.com",
    label: "Email",
    icon: MailIcon,
  },
];

export function SocialLinks() {
  return (
    <TooltipProvider>
      <ul className="flex flex-wrap gap-1">
        {socials.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  // Some browser extensions rewrite link attributes before
                  // React hydrates, which trips a (harmless) hydration warning.
                  // The markup is deterministic, so suppress it on these links.
                  suppressHydrationWarning
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </TooltipProvider>
  );
}
