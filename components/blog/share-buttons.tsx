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

import { CopyButton } from "@/components/copy-button";
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
      setTimeout(() => set(false), 1500);
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
      } catch {
        // user cancelled
      }
    }
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
      <div className="relative inline-flex items-stretch">
        <CopyButton
          text={url}
          variant="outline"
          size="sm"
          aria-haspopup="false"
          className="gap-2 rounded-r-none border-r-0 border-border bg-background px-3 text-xs text-foreground hover:bg-muted"
          idleIcon={<CopyIcon />}
          doneIcon={<CheckIcon className="text-emerald-500" />}
          aria-label="Copy page link"
        >
          <span>Copy Page</span>
        </CopyButton>
        <span aria-hidden="true" className="w-px self-stretch bg-border" />
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === "copy" ? null : "copy"))}
          aria-haspopup="menu"
          aria-expanded={openMenu === "copy"}
          aria-label="More copy options"
          className="inline-flex h-7 items-center justify-center rounded-r-sm border border-l-0 border-border bg-background px-2 transition-colors hover:bg-muted aria-expanded:bg-muted"
        >
          <ChevronDownIcon
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              openMenu === "copy" && "rotate-180",
            )}
          />
        </button>

        {openMenu === "copy" && (
          <div
            role="menu"
            aria-label="Copy options"
            className={cn(
              "absolute left-0 top-full z-50 mt-2 w-52 origin-top-left",
              "rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg shadow-black/10",
            )}
          >
            <button
              role="menuitem"
              type="button"
              onClick={onCopyMarkdown}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
            >
              {copiedMarkdown ? (
                <CheckIcon className="size-4 text-emerald-500" />
              ) : (
                <FileCode2Icon className="size-4 text-muted-foreground" />
              )}
              <span>
                {copiedMarkdown ? "Markdown copied" : "Copy as Markdown"}
              </span>
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={onCopyTitle}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
            >
              {copiedTitle ? (
                <CheckIcon className="size-4 text-emerald-500" />
              ) : (
                <HashIcon className="size-4 text-muted-foreground" />
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
          aria-haspopup="menu"
          aria-expanded={openMenu === "share"}
          aria-label="Share menu"
          className="cursor-pointer flex size-7 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:bg-muted"
        >
          <Share className="size-4" />
        </button>

        {openMenu === "share" && (
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
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
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
              onClick={() => setOpenMenu(null)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
            >
              <FaXTwitter className="size-4 text-muted-foreground" />
              <span>Share on X</span>
            </a>
            <a
              role="menuitem"
              href={liHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenMenu(null)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
            >
              <FaLinkedinIn className="size-4 text-muted-foreground" />
              <span>Share on LinkedIn</span>
            </a>
            <button
              role="menuitem"
              type="button"
              onClick={onNativeShare}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
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
