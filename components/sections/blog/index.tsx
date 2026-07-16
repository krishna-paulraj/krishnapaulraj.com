import Link from "next/link";

import HighlightedHeading from "@/components/ui/highlighted-heading";
import { getBlogPosts } from "@/lib/blog";

export default function BlogSection() {
  const posts = getBlogPosts();
  if (posts.length === 0) return null;

  return (
    <div className="mt-5 w-full border-t pt-5">
      <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
      <HighlightedHeading className="my-4">
        Sharing knowledge as I learn
      </HighlightedHeading>

      <ul className="divide-border mt-2 divide-y">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
            >
              <div className="flex-1">
                <p className="text-foreground font-semibold group-hover:underline">
                  {post.title}
                </p>
                {post.description && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                    {post.description}
                  </p>
                )}
              </div>
              {post.createdAt && (
                <time
                  dateTime={post.createdAt}
                  className="text-muted-foreground shrink-0 text-sm"
                >
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
