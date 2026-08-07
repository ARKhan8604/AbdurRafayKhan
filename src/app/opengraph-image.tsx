import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — Full-Stack Developer & AI Builder`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          background: "#0a0a0a",
          padding: 90,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#fff",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            AR
          </div>
          <span style={{ color: "#a1a1aa", fontSize: 26 }}>Portfolio</span>
        </div>
        <div style={{ display: "flex", color: "#fff", fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          {SITE.name}
        </div>
        <div style={{ display: "flex", color: "#3b82f6", fontSize: 34, fontWeight: 500 }}>
          Computer Science Student · Full-Stack Developer · AI Builder
        </div>
        <div style={{ display: "flex", color: "#71717a", fontSize: 26, maxWidth: 900 }}>
          I build fast, thoughtful web products — from AI-powered apps to polished business sites.
        </div>
      </div>
    ),
    { ...size }
  );
}
