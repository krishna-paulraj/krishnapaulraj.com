import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Constant-time owner-key check for board writes. Hashing both sides first
 * gives `timingSafeEqual` equal-length buffers, so neither key length nor
 * content leaks through timing.
 */
export function boardKeyMatches(
  provided: string | null,
  secret: string,
): boolean {
  if (!provided) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(secret));
}
