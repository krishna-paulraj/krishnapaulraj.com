"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CopyButton } from "@/components/ui/copy-button";

type Target = { el: HTMLElement; code: string };

const SELECTOR = "article figure[data-rehype-pretty-code-figure]";

export default function ArticleCopyButtons() {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const figures = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTOR),
    );

    const items: Target[] = [];
    for (const figure of figures) {
      const pre = figure.querySelector("pre");
      if (!pre) continue;
      if (getComputedStyle(figure).position === "static") {
        figure.style.position = "relative";
      }
      items.push({ el: figure, code: pre.textContent ?? "" });
    }
    // Discovering server-rendered code blocks is an external-DOM read;
    // setState here is the correct way to bridge that into React's tree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargets(items);
  }, []);

  return (
    <>
      {targets.map((t, i) =>
        createPortal(
          <CopyButton
            text={t.code}
            variant="ghost"
            size="sm"
            aria-label="Copy code"
            className="text-muted-foreground hover:text-foreground absolute right-2 bottom-2 z-10 bg-black/40 backdrop-blur-sm"
            idleIcon={<CopyIcon className="size-3.5" />}
            doneIcon={<CheckIcon className="size-3.5" />}
          >
            Copy
          </CopyButton>,
          t.el,
          `code-copy-${i}`,
        ),
      )}
    </>
  );
}
