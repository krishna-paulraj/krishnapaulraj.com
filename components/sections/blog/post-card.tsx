import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import pfpDark from "@/assets/pfp_dark.png";
import pfpLight from "@/assets/pfp_light.png";
import { PostCover } from "@/components/sections/blog/post-cover";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_AUTHOR } from "@/config/site";
import { formatPostDate } from "@/lib/dates";
import type { BlogPost } from "@/types";

const AUTHOR_ROLE = "Software Engineer";

/**
 * The ReUI `blog-1` post card, transcribed 1:1 from the block (Card +
 * CardContent + size-7 Avatar footer), with the site's realities swapped in:
 * real post links instead of `href="#"`, the CSS gradient covers instead of
 * stock photography, and a theme-matched profile photo inside the Avatar
 * shell instead of AvatarImage (the portrait differs between light and dark).
 */
function AuthorAvatar() {
  return (
    <Avatar className="size-7">
      <Image
        src={pfpLight}
        alt=""
        fill
        sizes="28px"
        className="rounded-full object-cover dark:hidden"
      />
      <Image
        src={pfpDark}
        alt=""
        fill
        sizes="28px"
        className="hidden rounded-full object-cover dark:block"
      />
    </Avatar>
  );
}

type PostCardProps = {
  post: BlogPost;
  /** Canonical index in the full post list — drives the cover palette. */
  index: number;
};

export function PostCard({ post, index }: PostCardProps) {
  const href = `/blog/${post.slug}`;

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <Link
        href={href}
        aria-label={`Read ${post.title}`}
        className="bg-muted focus-visible:ring-ring focus-visible:ring-offset-background relative block aspect-[16/10] w-full overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <PostCover
          index={index}
          className="absolute inset-0 aspect-auto h-full w-full"
        />
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-2 pb-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {post.createdAt && (
            <>
              <time dateTime={post.createdAt}>
                {formatPostDate(post.createdAt)}
              </time>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{post.readingTimeMinutes} min read</span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-foreground line-clamp-2 text-base leading-snug font-semibold">
            <Link
              href={href}
              className="hover:text-primary focus-visible:text-primary underline-offset-2 transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
            >
              {post.title}
            </Link>
          </h2>
          {post.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
              {post.description}
            </p>
          )}
        </div>

        <div className="border-border/60 mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <AuthorAvatar />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-foreground truncate text-[0.8125rem] font-medium">
                {SITE_AUTHOR}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {AUTHOR_ROLE}
              </span>
            </div>
          </div>
          <Link
            href={href}
            aria-label={`Read ${post.title}`}
            className="group/read text-primary inline-flex shrink-0 items-center gap-1 text-sm font-medium underline-offset-2 transition-colors hover:underline focus-visible:underline focus-visible:outline-none"
          >
            Read
            <ArrowUpRightIcon
              aria-hidden
              className="size-3.5 transition-transform duration-200 ease-out motion-safe:group-hover/read:translate-x-0.5 motion-safe:group-hover/read:-translate-y-0.5"
            />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
