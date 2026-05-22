"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Share2Icon,
} from "lucide-react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export default function ShareButtons({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [open, setOpen] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyTo = async (
    value: string,
    set: (v: boolean) => void,
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      set(true);
      setTimeout(() => set(false), 1500);
    } catch {
      // ignore
    }
  };

  const onCopyPage = () => copyTo(url, setCopiedPage);
  const onCopyLink = () => copyTo(url, setCopiedLink);

  const onNativeShare = async () => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title, url });
        setOpen(false);
        return;
      } catch {
        // user cancelled
      }
    }
    // Fallback: copy link
    void copyTo(url, setCopiedLink);
  };

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`;

  return (
    <div ref={rootRef} className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onCopyPage}
        aria-label={copiedPage ? "Page link copied" : "Copy page link"}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
      >
        {copiedPage ? (
          <CheckIcon className="size-4 text-emerald-500" />
        ) : (
          <CopyIcon className="size-4" />
        )}
        <span>{copiedPage ? "Copied" : "Copy Page"}</span>
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Share menu"
          className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
        >
          <Share2Icon className="size-4" />
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Share options"
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-56 origin-top-right",
              "rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/10",
            )}
          >
            <button
              role="menuitem"
              type="button"
              onClick={onCopyLink}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {copiedLink ? (
                <CheckIcon className="size-4 text-emerald-500" />
              ) : (
                <LinkIcon className="size-4 text-muted-foreground" />
              )}
              <span>{copiedLink ? "Link copied" : "Copy link"}</span>
            </button>
            <a
              role="menuitem"
              href={xHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <FaXTwitter className="size-4 text-muted-foreground" />
              <span>Share on X</span>
            </a>
            <a
              role="menuitem"
              href={liHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <FaLinkedinIn className="size-4 text-muted-foreground" />
              <span>Share on LinkedIn</span>
            </a>
            <button
              role="menuitem"
              type="button"
              onClick={onNativeShare}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <MoreHorizontalIcon className="size-4 text-muted-foreground" />
              <span>Other app</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
