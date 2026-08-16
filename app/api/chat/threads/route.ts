/**
 * The inbox list. Owner only — every handler under /api/chat/threads checks
 * isOwner() first rather than relying on any central gate.
 */

import { isOwner } from "@/lib/admin-auth";
import type { ChatStatus } from "@/lib/chat";
import { listThreads } from "@/lib/chat-store";

const NO_STORE = { "Cache-Control": "no-store" } as const;
const PAGE_SIZE = 30;

export async function GET(request: Request) {
  if (!(await isOwner())) {
    return Response.json(
      { error: "Not allowed." },
      { status: 401, headers: NO_STORE },
    );
  }

  const url = new URL(request.url);
  const requested = url.searchParams.get("status");
  const status: ChatStatus | "all" =
    requested === "archived" || requested === "all" ? requested : "open";

  try {
    const threads = await listThreads({
      status,
      cursor: url.searchParams.get("cursor"),
      limit: PAGE_SIZE,
    });
    return Response.json(
      {
        threads,
        // Absent once a page comes back short — that is the end of the list.
        nextCursor:
          threads.length === PAGE_SIZE
            ? threads[threads.length - 1]!.lastMessageAt
            : null,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("inbox list failed", error);
    return Response.json(
      { error: "Couldn't load the inbox." },
      { status: 503, headers: NO_STORE },
    );
  }
}
