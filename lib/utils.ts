import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the English ordinal suffix for a number:
 * 1 → "st", 2 → "nd", 3 → "rd", 4 → "th", 11–13 → "th", 21 → "st", …
 */
export function ordinalSuffix(n: number): string {
  const mod100 = Math.abs(n) % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (mod100 % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
