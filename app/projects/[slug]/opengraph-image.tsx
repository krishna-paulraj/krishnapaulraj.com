import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/constants";
import {
  TECH,
  getProjectBySlug,
  getProjectSlugs,
  type ProjectStatus,
} from "@/lib/projects";

export const alt = "Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  archived: "Archived",
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  live: "#10b981",
  "in-progress": "#f59e0b",
  archived: "#71717a",
};

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
  const project = getProjectBySlug(slug);

  const title = project?.name ?? "Projects";
  const description = project?.description ?? "";
  const year = project?.year;
  const status = project?.status;
  const techLabels = (project?.tech ?? [])
    .map((key) => TECH[key]?.label)
    .filter(Boolean)
    .slice(0, 3);

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
          <span>krishnapaulraj.com / projects</span>
        </div>
        {year && <span>{year}</span>}
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
          {status && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "9999px",
                  background: STATUS_COLOR[status],
                }}
              />
              <span style={{ fontSize: "18px" }}>{STATUS_LABEL[status]}</span>
            </div>
          )}
        </div>
        {techLabels.length > 0 ? (
          <div style={{ display: "flex", gap: "14px", color: "#a1a1aa" }}>
            {techLabels.map((label) => (
              <span key={label}>{label}</span>
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
