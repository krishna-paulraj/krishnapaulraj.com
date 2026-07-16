"use client";

import { useEffect, useState } from "react";

import { ordinalSuffix } from "@/lib/utils";

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/visitors", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || data?.count == null) return;
        setCount(data.count);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (count == null) return null;

  return (
    <span>
      You&apos;re the{" "}
      <strong className="text-foreground">
        {count.toLocaleString()}
        <sup>{ordinalSuffix(count)}</sup>
      </strong>{" "}
      visitor
    </span>
  );
}
