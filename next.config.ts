import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Blog cover artwork (the blog-1 block's Unsplash pieces).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      // The resume page embeds this PDF in an <object>, and browsers apply
      // X-Frame-Options to object/embed loads too — DENY blocks even
      // same-origin embedding, leaving only the fallback. Later rules win
      // for the same header key, so this loosens just the PDF.
      {
        source: "/resume.pdf",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
