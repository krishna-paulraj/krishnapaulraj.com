"use client";

import { useEffect, useState } from "react";

export default function PostViews({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const seenKey = `viewed-post:${slug}`;
    const alreadyViewed =
      typeof window !== "undefined" && !!window.localStorage.getItem(seenKey);

    const url = `/api/posts/${slug}/views`;
    const request = alreadyViewed ? fetch(url) : fetch(url, { method: "POST" });

    request
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || data?.count == null) return;
        setViews(data.count);
        if (!alreadyViewed) {
          try {
            window.localStorage.setItem(seenKey, "1");
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // ignore
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (views == null) return null;

  return (
    <>
      <span aria-hidden="true">·</span>
      <span>
        {views.toLocaleString()} {views === 1 ? "view" : "views"}
      </span>
    </>
  );
}
