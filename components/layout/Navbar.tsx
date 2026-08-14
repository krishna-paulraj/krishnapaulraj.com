"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchTrigger } from "@/components/search/search";
import { ThemeToggleButton } from "@/components/theme/theme";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/config/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      // Pinned during view transitions — see globals.css.
      style={{ viewTransitionName: "site-header" }}
      className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm"
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-16"
      >
        <ul className="flex items-center gap-4 sm:gap-6">
          {NAV_LINKS.map(({ href, label, mobile }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className={mobile ? undefined : "hidden sm:block"}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm transition-colors",
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2 sm:gap-3">
          <SearchTrigger />
          <ThemeToggleButton variant="circle" start="top-right" blur={true} />
        </div>
      </nav>
    </header>
  );
}
