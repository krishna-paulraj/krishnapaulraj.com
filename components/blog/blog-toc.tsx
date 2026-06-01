"use client";

import { TOCMinimap, type TOCItemType } from "@/components/toc-minimap";

/**
 * Fixed right-rail table-of-contents minimap for blog posts.
 * Hidden on narrow viewports where the centered article leaves no gutter.
 */
export default function BlogToc({ items }: { items: TOCItemType[] }) {
  if (items.length === 0) return null;

  return (
    <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <TOCMinimap items={items} />
    </div>
  );
}
