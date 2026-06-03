import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d5016 100%)",
        color: "#f7f7f5",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#4ade80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
          }}
        >
          🍳
        </div>
        <span style={{ fontSize: 56, fontWeight: 700 }}>{siteConfig.name}</span>
      </div>
      <p
        style={{
          fontSize: 28,
          maxWidth: 800,
          textAlign: "center",
          lineHeight: 1.4,
          opacity: 0.9,
        }}
      >
        {siteConfig.description}
      </p>
    </div>,
    { ...size },
  );
}
