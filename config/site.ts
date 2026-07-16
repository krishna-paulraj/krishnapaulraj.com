/**
 * Site-wide configuration: canonical identity and navigation.
 *
 * The `SITE_*` identity constants are defined in `lib/constants` (single source
 * of truth) and re-exported here as the conventional `@/config` entry point.
 */
export {
  SITE_AUTHOR,
  SITE_AUTHOR_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";

export type NavLink = {
  href: string;
  label: string;
  /** Whether this link appears in the mobile navigation. */
  mobile: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home", mobile: true },
  { href: "/blog", label: "Blog", mobile: true },
  { href: "/board", label: "Board", mobile: true },
  { href: "/components", label: "Components", mobile: false },
  { href: "/resume", label: "Resume", mobile: true },
];
