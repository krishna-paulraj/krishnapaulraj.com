import type { Metadata } from "next";

import { InboxShell } from "@/components/sections/inbox";

/**
 * Private, and not just by convention — every /api/chat/threads handler checks
 * the session cookie. The noindex is belt-and-braces so the URL never shows up
 * in a search result even if it leaks into a link somewhere.
 */
export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
      <InboxShell>{children}</InboxShell>
    </div>
  );
}
