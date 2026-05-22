"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
        createPortal(<CopyButton code={t.code} />, t.el, `code-copy-${i}`),
      )}
    </>
  );
}

function CopyButton({ code }: { code: string }) {
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
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="code-copy-button"
    >
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
