import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminResponse } from "@/lib/require-admin";
import { enforceRateLimit, getClientIp, RateLimitedError } from "@/lib/rate-limit";
import { isCloudinaryConfigured, signUpload } from "@/lib/cloudinary";

const bodySchema = z.object({
  folder: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const denied = await requireAdminResponse();
  if (denied) return denied;

  try {
    const ip = await getClientIp();
    await enforceRateLimit("cloudinarySign", ip);
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return NextResponse.json(
        { error: "Too many upload requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(err.retryAfter) } }
      );
    }
    throw err;
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 400 });
  }

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const folder = (parsed.data.folder ?? "portfolio").replace(/[^a-z0-9/_-]/gi, "").slice(0, 150);

  try {
    return NextResponse.json(signUpload(`portfolio/${folder}`));
  } catch {
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
