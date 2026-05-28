import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #18181b 50%, #0a0a0a 100%)",
        color: "#fafafa",
        fontSize: 120,
        fontWeight: 700,
        fontFamily: "sans-serif",
        letterSpacing: "-0.06em",
      }}
    >
      k
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 22,
          width: 16,
          height: 16,
          borderRadius: 9999,
          background: "#0ea5e9",
        }}
      />
    </div>,
    { ...size },
  );
}
