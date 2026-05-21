"use client";

import { useEffect, useState } from "react";

export default function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setCount(data.count))
      .catch(() => {});
  }, []);

  if (count === null) return null;

  const suffix =
    count % 100 >= 11 && count % 100 <= 13
      ? "th"
      : (["th", "st", "nd", "rd"][Math.min(count % 10, 3)] ?? "th");

  return (
    <span>
      You&apos;re the{" "}
      <strong className="text-foreground">
        {count.toLocaleString()}
        <sup>{suffix}</sup>
      </strong>{" "}
      visitor
    </span>
  );
}
