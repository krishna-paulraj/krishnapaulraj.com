"use client";

import { CheckIcon, CopyIcon } from "lucide-react";

import { CopyButton } from "@/components/copy-button";

export default function CodeBlock({
  code,
  html,
}: {
  code: string;
  html: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border">
      <div
        className="terminal-code-block overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton
        text={code}
        variant="ghost"
        size="sm"
        aria-label="Copy code"
        className="absolute right-2 bottom-2 bg-white/10 text-white/70 backdrop-blur-sm hover:bg-white/20 hover:text-white dark:hover:bg-white/20"
        idleIcon={<CopyIcon className="size-3.5" />}
        doneIcon={<CheckIcon className="size-3.5" />}
      >
        Copy
      </CopyButton>
    </div>
  );
}
