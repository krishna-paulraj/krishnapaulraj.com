"use client";

import { MessageCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatLauncherProps = React.ComponentProps<typeof Button> & {
  open: boolean;
  unread: number;
};

/**
 * The floating button. Sits at z-40, the same tier as the blog table of
 * contents — they can never collide, because the TOC is vertically centred and
 * capped at half the viewport while this stays within ~72px of the bottom.
 * Anything modal at z-50 correctly covers both.
 *
 * Props and ref are forwarded so the widget can focus it again on close.
 */
export function ChatLauncher({
  open,
  unread,
  ref,
  ...props
}: ChatLauncherProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const label = open
    ? "Close chat"
    : unread > 0
      ? `Chat with Krishna, ${unread} unread`
      : "Chat with Krishna";

  return (
    <Button
      ref={ref}
      size="icon-lg"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={label}
      className="relative size-12 rounded-full shadow-lg"
      {...props}
    >
      <MessageCircleIcon />
      {!open && unread > 0 && (
        <span
          aria-hidden
          className="ring-background absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-(--chat-accent) text-[10px] font-semibold text-white ring-2"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Button>
  );
}
