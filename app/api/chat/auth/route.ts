/**
 * The owner's login for /inbox. Exchanges the ADMIN_SECRET passphrase for a
 * signed HttpOnly session cookie; the passphrase itself is never persisted
 * client-side.
 */

import { attachAdminCookie, clearAdminCookie, isOwner } from "@/lib/admin-auth";
import { boardKeyMatches } from "@/lib/board-auth";
import { rateLimit } from "@/lib/redis";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/** Mount-time check: is the cookie we already hold still good? */
export async function GET() {
  return new Response(null, {
    status: (await isOwner()) ? 204 : 401,
    headers: NO_STORE,
  });
}

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return Response.json(
      { error: "The inbox isn't configured." },
      { status: 503, headers: NO_STORE },
    );
  }

  let passphrase: unknown;
  try {
    ({ passphrase } = (await request.json()) as { passphrase?: unknown });
  } catch {
    return Response.json(
      { error: "Invalid request." },
      { status: 400, headers: NO_STORE },
    );
  }

  if (typeof passphrase === "string" && boardKeyMatches(passphrase, secret)) {
    await attachAdminCookie(secret);
    return new Response(null, { status: 204, headers: NO_STORE });
  }

  // Rate-limit failures only, so a fat-fingered passphrase can't lock the owner
  // out of their own inbox.
  const { ok: underLimit } = await rateLimit("chat-auth", 5, 60 * 15);
  if (!underLimit) {
    return Response.json(
      { error: "Too many attempts. Try again shortly." },
      { status: 429, headers: NO_STORE },
    );
  }

  return Response.json(
    { error: "That passphrase didn't match." },
    { status: 401, headers: NO_STORE },
  );
}

export async function DELETE() {
  await clearAdminCookie();
  return new Response(null, { status: 204, headers: NO_STORE });
}
