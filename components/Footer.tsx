import Link from "next/link";
import { MailIcon } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import VisitorCount from "@/components/VisitorCount";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/resume", label: "Resume" },
  { href: "/terminal", label: "Terminal" },
  { href: "/gears", label: "Gears" },
  { href: "/rss.xml", label: "RSS", external: true },
];

const socialLinks = [
  { href: "https://x.com/thedevkrish", label: "X / Twitter", icon: FaXTwitter },
  {
    href: "https://github.com/krishnapaulraj",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    href: "https://linkedin.com/in/krishnapaulraj",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
  {
    href: "https://youtube.com/@thedevkrish",
    label: "YouTube",
    icon: FaYoutube,
  },
  { href: "mailto:blocsysdevs@gmail.com", label: "Email", icon: MailIcon },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40 text-muted-foreground">
      <div className="mx-auto w-full max-w-2xl px-6 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Navigate */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Navigate
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {navLinks.map(({ href, label, external }) =>
                external ? (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ) : (
                  <li key={href}>
                    <Link
                      href={href}
                      className="transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              Connect
            </p>
            <ul className="flex flex-wrap gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-border pt-6 text-xs sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} Suresh-Krishna Paulraj. All rights
            reserved.
          </p>
          <VisitorCount />
        </div>
      </div>
    </footer>
  );
}
