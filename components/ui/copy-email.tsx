"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CopyStateIcon } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";

export function CopyEmail({ email }: { email: string }) {
  const { state, copy } = useCopyToClipboard();

  return (
    <span className="flex items-center">
      <button
        type="button"
        onClick={() => copy(email)}
        className="text-foreground cursor-pointer underline-offset-4 hover:underline"
      >
        <span className="sm:hidden">Email</span>
        <span className="hidden sm:inline">{email}</span>
      </button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Copy email"
        onClick={() => copy(email)}
      >
        <CopyStateIcon state={state} />
      </Button>
    </span>
  );
}
