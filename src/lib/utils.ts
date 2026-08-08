import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format a date range like "Jan 2024 — Present". */
export function formatRange(start?: Date | string | null, end?: Date | string | null, current?: boolean) {
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const from = start ? fmt(start) : "";
  const to = current ? "Present" : end ? fmt(end) : "";
  if (from && to) return `${from} — ${to}`;
  return from || to || "";
}

/**
 * Ensure a user-entered URL has a protocol, so it's treated as absolute
 * rather than a relative path on the current site. Leaves mailto:/tel:
 * links and empty values untouched.
 */
export function normalizeUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return trimmed || undefined;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed; // already has a scheme
  return `https://${trimmed}`;
}

/** Extract a host label from a URL (e.g. "github.com"). */
export function hostOf(url?: string | null) {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Deterministic hue (0-360) from a string — used for placeholder gradients. */
export function hueFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/**
 * Serialize a value for embedding in a `<script type="application/ld+json">`
 * tag. JSON.stringify alone is not safe here: a field containing the
 * literal text `</script>` would close the tag early and let anything
 * after it run as markup/script. Escaping `<` as a unicode sequence
 * prevents that while leaving the JSON semantically identical.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
