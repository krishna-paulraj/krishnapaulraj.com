import { ImageResponse } from "next/og";

import { getBlogPost, getBlogSlugs } from "@/lib/blog";
import { SITE_URL } from "@/lib/constants";

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

function formatDate(value: string | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + "…";
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  const title = post?.title ?? "Writing";
  const description = post?.description ?? "";
  const date = formatDate(post?.createdAt);
  const tags = post?.tags ?? [];
  const readingTime = post?.readingTimeMinutes;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #18181b 50%, #0a0a0a 100%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "22px",
          color: "#a1a1aa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "9999px",
              background: "#0ea5e9",
            }}
          />
          <span>krishnapaulraj.com / writing</span>
        </div>
        {date && <span>{date}</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          style={{
            fontSize: title.length > 60 ? 60 : 76,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#fafafa",
          }}
        >
          {truncate(title, 140)}
        </div>
        {description && (
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1.35,
              color: "#a1a1aa",
              letterSpacing: "-0.01em",
            }}
          >
            {truncate(description, 180)}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "22px",
          color: "#71717a",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span>Suresh Krishna Paulraj</span>
          {readingTime && (
            <span style={{ fontSize: "18px" }}>{readingTime} min read</span>
          )}
        </div>
        {tags.length > 0 ? (
          <div style={{ display: "flex", gap: "14px", color: "#a1a1aa" }}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : (
          <span>{new URL(SITE_URL).host}</span>
        )}
      </div>
    </div>,
    { ...size },
  );
}
