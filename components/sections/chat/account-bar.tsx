"use client";

import { LogOutIcon } from "lucide-react";

import { initialsOf } from "@/components/sections/chat/message-avatar";
import { SignInButtons } from "@/components/sections/chat/sign-in-buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  OAUTH_LABELS,
  type ChatIdentity,
  type OAuthProvider,
} from "@/lib/chat";

type AccountBarProps = {
  identity: ChatIdentity | null;
  providers: OAuthProvider[];
  onSignOut: () => void;
  /**
   * Whether this visitor has actually said anything yet. Sign-in is pitched
   * only after the first message: it is an upgrade to a conversation that
   * already exists, and offering it to someone who has not typed a word is just
   * the account wall this design exists to avoid.
   */
  started: boolean;
};

export function AccountBar({
  identity,
  providers,
  onSignOut,
  started,
}: AccountBarProps) {
  if (identity) {
    return (
      <div className="border-border text-muted-foreground flex items-center gap-2 border-t px-3 py-2 text-xs">
        <Avatar className="size-5">
          {/* Radix's plain <img>, not next/image — a 32px decoration is not
              worth widening the remotePatterns allowlist in next.config.ts. */}
          {identity.avatarUrl && (
            <AvatarImage src={identity.avatarUrl} alt="" />
          )}
          <AvatarFallback className="text-[10px]">
            {initialsOf(identity.name)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate">
          Signed in as {identity.name ?? OAUTH_LABELS[identity.provider]}
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={onSignOut}
          className="shrink-0"
        >
          <LogOutIcon className="size-3" />
          Sign out
        </Button>
      </div>
    );
  }

  if (!started || providers.length === 0) return null;

  return (
    <div className="border-border text-muted-foreground flex items-center gap-2 border-t px-3 py-2 text-xs">
      <span className="min-w-0 flex-1">
        Sign in to pick this up on your other devices.
      </span>
      <SignInButtons providers={providers} compact className="shrink-0" />
    </div>
  );
}
