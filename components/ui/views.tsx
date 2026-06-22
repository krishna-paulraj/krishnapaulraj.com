"use client";

import { useEffect, useState } from "react";

export default function Views({ endpoint }: { endpoint: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(endpoint, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || data?.count == null) return;
        setViews(data.count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

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
