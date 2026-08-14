import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Cover artwork from the ReUI blog-1 block, cycling in the same order as its
 * demo (blue nebula → magenta aurora → orange/cyan spectrum).
 *
 * `index` is the post's position in the full newest-first list (not a filtered
 * slice), so a post keeps the same artwork on the index grid, in tag views,
 * and atop its own page.
 */
const COVERS = [
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=640&h=440&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=640&h=440&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&h=440&q=80",
] as const;

type PostCoverProps = {
  /** Canonical post index — position in the full newest-first post list. */
  index: number;
  className?: string;
};

/** Decorative only (the title carries the meaning), hence the empty alt. */
export function PostCover({ index, className }: PostCoverProps) {
  return (
    <Image
      src={COVERS[((index % COVERS.length) + COVERS.length) % COVERS.length]}
      alt=""
      width={640}
      height={400}
      sizes="(min-width: 768px) 40rem, 100vw"
      className={cn("aspect-[8/5] w-full object-cover", className)}
    />
  );
}
