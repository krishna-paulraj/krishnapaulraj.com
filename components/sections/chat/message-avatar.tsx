"use client";

import { UserIcon } from "lucide-react";
import Image from "next/image";

import pfpDark from "@/assets/pfp_dark.png";
import pfpLight from "@/assets/pfp_light.png";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Krishna's portrait, following the same approach as the blog post card: the
 * photo differs between light and dark, so it goes inside the Avatar shell as
 * two themed images rather than through AvatarImage.
 */
export function OwnerAvatar() {
  return (
    <Avatar className="size-8">
      <Image
        src={pfpLight}
        alt=""
        fill
        sizes="32px"
        className="rounded-full object-cover dark:hidden"
      />
      <Image
        src={pfpDark}
        alt=""
        fill
        sizes="32px"
        className="hidden rounded-full object-cover dark:block"
      />
    </Avatar>
  );
}

/**
 * Initials for the visitor, who has no picture. Falls back to a person icon
 * rather than "?" — the first message arrives before we have asked their name,
 * and a question mark there reads as something having gone wrong.
 */
export function VisitorAvatar({ name }: { name: string | null }) {
  const initials = (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Avatar className="size-8">
      <AvatarFallback className="text-xs">
        {initials || <UserIcon className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
