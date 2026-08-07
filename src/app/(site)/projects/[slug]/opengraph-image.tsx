import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/server/queries";
import { SITE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;
export const alt = "Project case study";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const title = project?.title ?? "Project";
  const description = project?.description ?? "";
  const tech = project?.technologies.slice(0, 5).join("  ·  ") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#a1a1aa", fontSize: 26 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            AR
          </div>
          {SITE.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", color: "#3b82f6", fontSize: 26, fontWeight: 600 }}>Case Study</div>
          <div style={{ display: "flex", color: "#fff", fontSize: 72, fontWeight: 700, lineHeight: 1.05, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ display: "flex", color: "#a1a1aa", fontSize: 30, maxWidth: 940, lineHeight: 1.35 }}>
            {description.slice(0, 140)}
          </div>
        </div>

        <div style={{ display: "flex", color: "#71717a", fontSize: 24, fontFamily: "monospace" }}>{tech}</div>
      </div>
    ),
    { ...size }
  );
}
