import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — Portfolio`,
    short_name: SITE.shortName,
    description: "Computer Science student, full-stack developer, and AI builder.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
  };
}
