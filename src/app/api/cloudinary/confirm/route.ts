import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/require-admin";
import { enforceRateLimit, getClientIp, RateLimitedError } from "@/lib/rate-limit";
import { enforceUploadSize } from "@/lib/cloudinary";

/**
 * Called by the client immediately after a Cloudinary upload completes.
 * Cloudinary's signed Upload API has no enforced byte-size cap, so this is
 * where oversized files actually get rejected: if `bytes` is over budget,
 * the asset is deleted server-side via the Admin API right away.
 */
const bodySchema = z.object({
  publicId: z.string().trim().min(1).max(400),
  resourceType: z.enum(["image", "raw", "video"]).default("image"),
  bytes: z.number().int().positive().max(1_000_000_000),
});

export async function POST(req: Request) {
  const denied = await requireAdminResponse();
  if (denied) return denied;

  try {
    const ip = await getClientIp();
    await enforceRateLimit("cloudinarySign", ip);
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(err.retryAfter) } });
    }
    throw err;
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { publicId, resourceType, bytes } = parsed.data;
  const ok = await enforceUploadSize(publicId, resourceType, bytes);
  if (!ok) {
    return NextResponse.json({ error: "File exceeds the maximum allowed size and was removed." }, { status: 413 });
  }
  return NextResponse.json({ ok: true });
}
