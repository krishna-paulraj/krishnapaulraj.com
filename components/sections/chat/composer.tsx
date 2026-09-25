"use client";

import { ArrowUpIcon } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useOnline } from "@/hooks/use-online";
import { CHAT_LIMITS } from "@/lib/chat";
import { cn } from "@/lib/utils";

/** Show the counter only once the cap is close enough to matter. */
const COUNTER_AT = CHAT_LIMITS.body * 0.8;

type ComposerProps = {
  onSend: (body: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  disabledHint?: string;
  className?: string;
};

export function Composer({
  onSend,
  placeholder = "Write a message…",
  disabled = false,
  disabledHint,
  className,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const online = useOnline();

  const blocked = disabled || sending;
  const canSend = value.trim().length > 0 && !blocked;

  async function submit() {
    if (!canSend) return;
    const body = value;
    setSending(true);
    // Clear optimistically so the field is ready for the next thought; the
    // message itself is rendered by the caller and survives a failed send.
    setValue("");
    try {
      await onSend(body);
    } finally {
      setSending(false);
      ref.current?.focus();
    }
  }

  return (
    <form
      className={cn("p-3", className)}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {!online && (
        <p className="text-muted-foreground px-1 pb-2 text-xs">
          You&apos;re offline — messages will send once you reconnect.
        </p>
      )}
      {/* The whole field is one surface, with the send control inside it. */}
      <div className="border-border bg-background focus-within:border-foreground/30 flex flex-col gap-2 rounded-2xl border p-2 transition-colors">
        <Textarea
          ref={ref}
          value={value}
          disabled={blocked}
          rows={2}
          enterKeyHint="send"
          maxLength={CHAT_LIMITS.body}
          placeholder={disabled && disabledHint ? disabledHint : placeholder}
          aria-label="Message"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            // isComposing is not optional: without it, the Enter that commits
            // an IME candidate sends a half-typed message.
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void submit();
            }
          }}
          className="max-h-32 min-h-14 resize-none border-0 bg-transparent px-2 py-1 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-2 ps-2">
          <span
            aria-live="polite"
            className={cn(
              "text-muted-foreground text-xs tabular-nums",
              value.length <= COUNTER_AT && "invisible",
              value.length >= CHAT_LIMITS.body && "text-destructive",
            )}
          >
            {value.length} / {CHAT_LIMITS.body}
          </span>
          <Button
            type="submit"
            size="icon"
            disabled={!canSend}
            aria-label="Send message"
            className="size-9 shrink-0 rounded-full"
          >
            <ArrowUpIcon />
          </Button>
        </div>
      </div>
    </form>
  );
}
