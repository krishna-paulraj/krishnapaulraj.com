"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { ChatLauncher } from "@/components/sections/chat/chat-launcher";
import { ChatPanel } from "@/components/sections/chat/chat-panel";
import { useChatThread } from "@/hooks/use-chat-thread";
import { useIsMobile } from "@/hooks/use-media-query";

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const chat = useChatThread(open);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Closing a dialog should hand focus back to what opened it, or the
    // keyboard user is dropped at the top of the document.
    launcherRef.current?.focus();
  }, []);

  // The owner reads these conversations from the inbox; showing them the
  // visitor-side widget there would just be confusing.
  if (pathname?.startsWith("/inbox")) return null;

  // A 503 on the first check almost always means the database isn't
  // configured. That is a server problem, and pushing it at a reader browsing a
  // portfolio helps nobody — the widget simply isn't there.
  if (chat.status === "error" && chat.messages.length === 0) return null;

  return (
    <div
      // Without a name, this fixed element gets swept into the root cross-fade
      // on every view transition — which here means every blog navigation and
      // every theme toggle. Same treatment as the site header.
      style={{ viewTransitionName: "chat-widget" }}
    >
      <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6">
        <ChatLauncher
          ref={launcherRef}
          open={open}
          unread={chat.unread}
          onClick={() => (open ? close() : setOpen(true))}
          // The panel carries its own close button, so a second one floating
          // beside it is just clutter. Kept mounted rather than unmounted so
          // focus has somewhere to return to on close.
          className={open ? "pointer-events-none opacity-0" : undefined}
        />
      </div>

      <ChatPanel open={open} onClose={close} chat={chat} isMobile={isMobile} />

      {/*
        Announced separately rather than by mutating the launcher's own label —
        screen readers handle a label change on a focused element inconsistently.
      */}
      <span aria-live="polite" className="sr-only">
        {chat.unread > 0
          ? `${chat.unread} unread ${chat.unread === 1 ? "reply" : "replies"}`
          : ""}
      </span>
    </div>
  );
}
