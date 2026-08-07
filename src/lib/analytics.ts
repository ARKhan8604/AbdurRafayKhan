import posthog from "posthog-js";

/** Typed analytics events — keeps capture calls consistent and greppable. */
export type AnalyticsEvent =
  | { name: "project_opened"; props: { slug: string; from?: string } }
  | { name: "resume_downloaded"; props?: Record<string, never> }
  | { name: "external_link_clicked"; props: { platform: string; url?: string } }
  | { name: "command_palette_used"; props?: { action?: string } }
  | { name: "command_palette_opened"; props?: Record<string, never> }
  | { name: "theme_toggled"; props: { theme: string } }
  | { name: "contact_clicked"; props?: { method?: string } }
  | { name: "explore_menu_opened"; props?: Record<string, never> };

export function capture<E extends AnalyticsEvent>(name: E["name"], props?: E["props"]) {
  if (typeof window === "undefined") return;
  try {
    posthog.capture(name, props as Record<string, unknown> | undefined);
  } catch {
    /* analytics must never break the UI */
  }
}
