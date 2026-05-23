"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchTrigger } from "@/components/search/search";
import { ThemeToggleButton } from "@/components/theme/theme";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-3xl items-center justify-between px-16 py-4"
      >
        <ul className="flex items-center gap-6">
          {links.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-3">
          <SearchTrigger />
          <ThemeToggleButton variant="circle" start="top-right" blur={true} />
        </div>
      </nav>
    </header>
  );
}
