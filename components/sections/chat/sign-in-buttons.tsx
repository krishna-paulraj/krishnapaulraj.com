"use client";

import { usePathname } from "next/navigation";
import { FaGithub, FaGoogle } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { OAUTH_LABELS, type OAuthProvider } from "@/lib/chat";
import { cn } from "@/lib/utils";

const ICONS: Record<
  OAuthProvider,
  React.ComponentType<{ className?: string }>
> = {
  github: FaGithub,
  google: FaGoogle,
};

type SignInButtonsProps = {
  providers: OAuthProvider[];
  /** Icon-only, for the strip above the composer where space is tight. */
  compact?: boolean;
  className?: string;
};

/**
 * Plain anchors, deliberately not next/link: these leave the app entirely for
 * github.com or accounts.google.com, and a client-side navigation to a route
 * handler that answers with a 303 to a third party is not a thing.
 */
export function SignInButtons({
  providers,
  compact = false,
  className,
}: SignInButtonsProps) {
  const pathname = usePathname();
  if (providers.length === 0) return null;

  // Where the callback sends them back to. Validated again server-side by
  // safeReturnTo — this end of it is a convenience, not the control.
  const returnTo = encodeURIComponent(pathname || "/");

  return (
    <div
      className={cn(compact ? "flex gap-1" : "flex flex-col gap-2", className)}
    >
      {providers.map((provider) => {
        const Icon = ICONS[provider];
        const label = `Continue with ${OAUTH_LABELS[provider]}`;
        return (
          <Button
            key={provider}
            asChild
            variant="outline"
            size={compact ? "icon-sm" : "sm"}
            {...(compact ? { "aria-label": label } : {})}
          >
            <a href={`/api/auth/${provider}?returnTo=${returnTo}`}>
              <Icon className="size-4" />
              {!compact && label}
            </a>
          </Button>
        );
      })}
    </div>
  );
}
