import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/auth";
import { enforceRateLimit, getClientIp, RateLimitedError } from "@/lib/rate-limit";

async function guarded(req: NextRequest, inner: (req: NextRequest) => Promise<Response>) {
  try {
    const ip = await getClientIp();
    await enforceRateLimit("auth", ip);
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(err.retryAfter) } }
      );
    }
    throw err;
  }
  return inner(req);
}

export async function GET(req: NextRequest) {
  return guarded(req, handlers.GET);
}

export async function POST(req: NextRequest) {
  return guarded(req, handlers.POST);
}
