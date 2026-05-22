import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/constants";

export const alt = "Suresh-Krishna Paulraj — Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "9999px",
            background: "#0ea5e9",
          }}
        />
        <span
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            letterSpacing: "-0.01em",
          }}
        >
          krishnapaulraj.com
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "88px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#fafafa",
          }}
        >
          <span>Suresh-Krishna</span>
          <span>Paulraj</span>
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "#a1a1aa",
            letterSpacing: "-0.01em",
          }}
        >
          Software Engineer · TypeScript, React, AI
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "20px",
          color: "#71717a",
        }}
      >
        <span>{new URL(SITE_URL).host}</span>
        <span>Notes · Projects · Writing</span>
      </div>
    </div>,
    { ...size },
  );
}
