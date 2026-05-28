import Link from "next/link";
import type { ReactNode } from "react";

export function ComponentCard({
  slug,
  title,
  description,
  preview,
}: {
  slug: string;
  title: string;
  description: string;
  preview: ReactNode;
}) {
  return (
    <Link
      href={`/components/${slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-background transition-colors hover:bg-muted/40"
    >
      <div className="flex min-h-32 items-center justify-center border-b border-border bg-muted/40 p-6">
        {preview}
      </div>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
