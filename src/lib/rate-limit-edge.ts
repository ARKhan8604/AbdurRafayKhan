import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

/**
 * Edge-runtime variant of the rate limiter (used only from middleware,
 * which can't use `next/headers` or any Node-only APIs). Same Upstash
 * REST-based backend as src/lib/rate-limit.ts — deliberately duplicated
 * rather than shared, to keep the edge bundle free of Node-only imports.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = redis
  ? {
      adminRead: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, "1 m"), prefix: "rl:admin-read" }),
    }
  : null;

export function getClientIpFromRequest(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function rateLimit(
  name: keyof NonNullable<typeof limiters>,
  key: string
): Promise<{ success: boolean; retryAfter: number }> {
  if (!limiters) return { success: true, retryAfter: 0 };
  try {
    const { success, reset } = await limiters[name].limit(key);
    return { success, retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) };
  } catch (err) {
    console.error(`edge rate-limit check failed for "${name}" — failing open:`, err);
    return { success: true, retryAfter: 0 };
  }
}
