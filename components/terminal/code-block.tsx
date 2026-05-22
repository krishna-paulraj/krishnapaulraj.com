"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export default function CodeBlock({
  code,
  html,
}: {
  code: string;
  html: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border">
      <div
        className="terminal-code-block overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-background/40 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
