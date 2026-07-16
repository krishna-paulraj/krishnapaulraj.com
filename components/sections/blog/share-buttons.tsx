"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FileCode2Icon,
  HashIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Share,
} from "lucide-react";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

type OpenMenu = "copy" | "share" | null;

export default function ShareButtons({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const resetTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Clear pending "copied" reset timers when the component unmounts.
  useEffect(() => {
    const timers = resetTimersRef.current;
    return () => timers.forEach((id) => clearTimeout(id));
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const copyTo = async (
    value: string,
    set: (v: boolean) => void,
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      set(true);
      const id = setTimeout(() => {
        set(false);
        resetTimersRef.current.delete(id);
      }, 1500);
      resetTimersRef.current.add(id);
    } catch {
      // ignore
    }
  };

  const onCopyLink = () => copyTo(url, setCopiedLink);
  const onCopyMarkdown = () => {
    void copyTo(`[${title}](${url})`, setCopiedMarkdown);
    setOpenMenu(null);
  };
  const onCopyTitle = () => {
    void copyTo(title, setCopiedTitle);
    setOpenMenu(null);
  };

  const onNativeShare = async () => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({ title, url });
        setOpenMenu(null);
        return;
      } catch (err) {
        // User dismissed the share sheet — that's a cancel, not a failure;
        // don't silently copy the link and flash "Link copied".
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    // Share genuinely unsupported or failed: fall back to copying the link.
    void onCopyLink();
  };

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`;

  return (
    <div ref={rootRef} className="inline-flex items-center gap-2">
      <div className="relative hidden items-stretch sm:inline-flex">
        <CopyButton
          text={url}
          variant="outline"
          size="sm"
          className="border-border bg-background text-foreground hover:bg-muted gap-2 rounded-r-none border-r-0 px-3 text-xs"
          idleIcon={<CopyIcon />}
          doneIcon={<CheckIcon className="text-foreground" />}
          aria-label="Copy page link"
        >
          <span>Copy Page</span>
        </CopyButton>
        <span aria-hidden="true" className="bg-border w-px self-stretch" />
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === "copy" ? null : "copy"))}
          aria-expanded={openMenu === "copy"}
          aria-label="More copy options"
          className="border-border bg-background hover:bg-muted aria-expanded:bg-muted inline-flex h-7 items-center justify-center rounded-r-sm border border-l-0 px-2 transition-colors"
        >
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground size-3.5 transition-transform",
              openMenu === "copy" && "rotate-180",
            )}
          />
        </button>

        {openMenu === "copy" && (
          // Plain buttons in a popover — not role="menu": the full APG menu
          // keyboard contract isn't implemented, so don't claim the role.
          <div
            className={cn(
              "absolute top-full left-0 z-50 mt-2 w-52 origin-top-left",
              "border-border bg-popover text-popover-foreground rounded-xl border p-1.5 shadow-lg shadow-black/10",
            )}
          >
            <button
              type="button"
              onClick={onCopyMarkdown}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              {copiedMarkdown ? (
                <CheckIcon className="text-foreground size-4" />
              ) : (
                <FileCode2Icon className="text-muted-foreground size-4" />
              )}
              <span>
                {copiedMarkdown ? "Markdown copied" : "Copy as Markdown"}
              </span>
            </button>
            <button
              type="button"
              onClick={onCopyTitle}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              {copiedTitle ? (
                <CheckIcon className="text-foreground size-4" />
              ) : (
                <HashIcon className="text-muted-foreground size-4" />
              )}
              <span>{copiedTitle ? "Title copied" : "Copy title"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === "share" ? null : "share"))}
          aria-expanded={openMenu === "share"}
          aria-label="Share options"
          className="border-border bg-background text-foreground hover:bg-muted flex size-7 cursor-pointer items-center justify-center rounded-sm border transition-colors"
        >
          <Share className="size-4" />
        </button>

        {openMenu === "share" && (
          <div
            className={cn(
              "absolute top-full right-0 z-50 mt-2 w-56 origin-top-right",
              "border-border bg-popover text-popover-foreground rounded-xl border p-1.5 shadow-lg shadow-black/10",
            )}
          >
            <button
              type="button"
              onClick={onCopyLink}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              {copiedLink ? (
                <CheckIcon className="text-foreground size-4" />
              ) : (
                <LinkIcon className="text-muted-foreground size-4" />
              )}
              <span>{copiedLink ? "Link copied" : "Copy link"}</span>
            </button>
            <a
              href={xHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenMenu(null)}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              <FaXTwitter className="text-muted-foreground size-4" />
              <span>Share on X</span>
            </a>
            <a
              href={liHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenMenu(null)}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              <FaLinkedinIn className="text-muted-foreground size-4" />
              <span>Share on LinkedIn</span>
            </a>
            <button
              type="button"
              onClick={onNativeShare}
              className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors"
            >
              <MoreHorizontalIcon className="text-muted-foreground size-4" />
              <span>Other app</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
