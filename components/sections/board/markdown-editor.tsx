"use client";

import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  StrikethroughIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "border-border bg-background placeholder:text-muted-foreground focus:border-foreground/30 w-full rounded-lg border px-3 py-2 text-sm outline-none";

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1 transition-colors"
    >
      {children}
    </button>
  );
}

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  ariaLabel: string;
};

/**
 * Trello-style description editor: markdown textarea with a small formatting
 * toolbar and a write/preview toggle. Formatting actions wrap the current
 * selection; ⌘/Ctrl+B and ⌘/Ctrl+I work inside the textarea.
 */
export function MarkdownEditor({
  value,
  onChange,
  maxLength,
  placeholder,
  ariaLabel,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const setValueAndSelection = (
    next: string,
    selectStart: number,
    selectEnd: number,
  ) => {
    if (next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selectStart, selectEnd);
    });
  };

  const wrapSelection = (before: string, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || "text";
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    setValueAndSelection(
      next,
      start + before.length,
      start + before.length + selected.length,
    );
  };

  const prefixLines = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const block = value.slice(lineStart, end);
    const prefixed = block
      .split("\n")
      .map((line) => (line.startsWith(prefix) ? line : prefix + line))
      .join("\n");
    const next = value.slice(0, lineStart) + prefixed + value.slice(end);
    setValueAndSelection(next, lineStart, lineStart + prefixed.length);
  };

  const insertLink = () => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || "link text";
    const next = `${value.slice(0, start)}[${selected}](https://)${value.slice(end)}`;
    // Select the URL placeholder so it can be typed over immediately.
    const urlStart = start + selected.length + 3;
    setValueAndSelection(next, urlStart, urlStart + 8);
  };

  const handleKeyDown: React.ComponentProps<"textarea">["onKeyDown"] = (
    event,
  ) => {
    if (!(event.metaKey || event.ctrlKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      wrapSelection("**");
    } else if (key === "i") {
      event.preventDefault();
      wrapSelection("*");
    }
  };

  const modeButton = (target: "write" | "preview", label: string) => (
    <button
      type="button"
      aria-pressed={mode === target}
      onClick={() => setMode(target)}
      className={cn(
        "rounded-md px-2 py-0.5 text-xs transition-colors",
        mode === target
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="border-border rounded-lg border">
      <div className="border-border flex items-center gap-1 border-b px-2 py-1.5">
        {modeButton("write", "Write")}
        {modeButton("preview", "Preview")}
        <span className="flex-1" />
        {mode === "write" && (
          <>
            <ToolbarButton label="Bold" onClick={() => wrapSelection("**")}>
              <BoldIcon aria-hidden className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton label="Italic" onClick={() => wrapSelection("*")}>
              <ItalicIcon aria-hidden className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Strikethrough"
              onClick={() => wrapSelection("~~")}
            >
              <StrikethroughIcon aria-hidden className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              label="Bulleted list"
              onClick={() => prefixLines("- ")}
            >
              <ListIcon aria-hidden className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton label="Link" onClick={insertLink}>
              <LinkIcon aria-hidden className="size-3.5" />
            </ToolbarButton>
          </>
        )}
      </div>

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={ariaLabel}
          rows={6}
          className={cn(
            FIELD_CLASS,
            "resize-none rounded-t-none border-0 focus:border-0",
          )}
        />
      ) : (
        <div className="prose prose-ncdai prose-zinc dark:prose-invert prose-sm min-h-37 max-w-none overflow-y-auto px-3 py-2">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground not-prose text-sm">
              Nothing to preview yet.
            </p>
          )}
        </div>
      )}

      <div className="border-border text-muted-foreground flex justify-between border-t px-2 py-1 text-[10px]">
        <span>Markdown supported</span>
        <span
          className={cn(value.length > maxLength - 50 && "text-foreground")}
        >
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
