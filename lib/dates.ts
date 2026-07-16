/**
 * Shared date-display helpers for content dates (`YYYY-MM-DD` or full ISO).
 *
 * Formatting is pinned to UTC and `en-US` so a date-only string renders as the
 * same calendar day everywhere — regardless of the build machine's or the
 * visitor's timezone.
 */
export function formatPostDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { timeZone: "UTC", ...options });
}

/** Millisecond timestamp for sorting; empty/invalid dates sort last. */
export function dateSortValue(value: string): number {
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}
