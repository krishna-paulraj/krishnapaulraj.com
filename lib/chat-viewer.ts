/**
 * Who is on the other end of a visitor request, and which conversation is
 * theirs.
 *
 * Every visitor handler goes through here, which is what keeps the guarantee
 * lib/chat-identity.ts set up: a thread id is never accepted from the client,
 * so there is no parameter to tamper with and no ownership check a future
 * handler can forget to write. Adding sign-in did not weaken that — it added a
 * second way to *derive* the thread, not a way to ask for one.
 */

import {
  findIdentityById,
  findThreadByIdentity,
  findThreadByTokenHash,
  type IdentityRow,
  type ThreadRow,
} from "@/lib/chat-store";
import { readVisitorTokenHash } from "@/lib/chat-identity";
import { readSessionIdentityId } from "@/lib/chat-session";

export type Visitor = {
  identity: IdentityRow | null;
  thread: ThreadRow | null;
};

export async function resolveVisitor(): Promise<Visitor> {
  const identityId = await readSessionIdentityId();
  // A session can outlive the row it names — the identity may have been
  // deleted since. Falling through to anonymous is the graceful outcome.
  const identity = identityId ? await findIdentityById(identityId) : null;

  if (identity) {
    const owned = await findThreadByIdentity(identity.id);
    // The account's own thread wins: it is the claim that survives a cleared
    // cookie jar and follows the visitor between devices.
    if (owned) return { identity, thread: owned };
  }

  const tokenHash = await readVisitorTokenHash();
  const thread = tokenHash ? await findThreadByTokenHash(tokenHash) : null;

  // A signed-in visitor never falls back onto a thread that belongs to someone
  // else's account. On a shared browser a leftover cookie would otherwise drop
  // them into the previous person's conversation — and, worse, let them write
  // into it. Signing in narrows who you are; it must never widen what you can
  // reach.
  if (identity && thread?.identity && thread.identity.id !== identity.id) {
    return { identity, thread: null };
  }

  return { identity, thread };
}
