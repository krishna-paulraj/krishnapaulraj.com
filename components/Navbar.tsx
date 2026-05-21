import Link from "next/link";
import { ThemeToggleButton } from "@/components/theme/theme";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-16 py-4">
        <ul className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <ThemeToggleButton variant="circle" start="top-right" blur={true} />
      </nav>
    </header>
  );
}
