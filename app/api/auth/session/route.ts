/**
 * The signed-in visitor's own view of their session.
 *
 * `session` is a static segment and Next matches those ahead of the sibling
 * `[provider]` one, so this never collides with /api/auth/github.
 */

import { toIdentity } from "@/lib/chat-store";
import { clearSessionCookie } from "@/lib/chat-session";
import { clearVisitorCookie } from "@/lib/chat-identity";
import { resolveVisitor } from "@/lib/chat-viewer";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET() {
  try {
    const { identity } = await resolveVisitor();
    return Response.json(
      { identity: identity ? toIdentity(identity) : null },
      { headers: NO_STORE },
    );
  } catch {
    // The widget treats this as "not signed in", which is the safe reading.
    return Response.json({ identity: null }, { headers: NO_STORE });
  }
}

/**
 * Sign out. Both cookies go, not just the session.
 *
 * Leaving the anonymous token behind would mean that on a shared machine the
 * next person to open the widget lands straight in the previous person's
 * conversation — signed out, but still reading it. "Sign out" has to mean the
 * conversation is no longer reachable from this browser, and the thread itself
 * is untouched: signing back in brings it straight back.
 */
export async function DELETE() {
  await clearSessionCookie();
  await clearVisitorCookie();
  return new Response(null, { status: 204, headers: NO_STORE });
}
