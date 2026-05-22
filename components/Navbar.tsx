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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
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
                      ? "font-medium text-zinc-900 dark:text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
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
