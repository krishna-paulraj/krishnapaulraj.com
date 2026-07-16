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
      className="group border-border bg-background hover:bg-muted/40 block overflow-hidden rounded-lg border transition-colors"
    >
      <div className="border-border bg-muted/40 flex min-h-32 items-center justify-center border-b p-6">
        {preview}
      </div>
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-foreground text-base font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}
