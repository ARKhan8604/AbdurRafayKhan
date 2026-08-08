import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Distributed rate limiting via Upstash Redis (REST-based — works from any
 * serverless/edge runtime, and state is shared across every Vercel instance,
 * unlike an in-memory counter which resets per-lambda and is trivially
 * bypassed by hitting a fresh instance).
 *
 * If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN aren't set, limiting
 * degrades to fail-open (requests are allowed) so the site never goes down
 * over a missing integration — but this is loudly logged, and the final
 * security report calls it out as a required follow-up. Fail-open (not
 * fail-closed) is a deliberate choice here: outages in a rate-limit lookup
 * must not become a bigger self-inflicted outage than the traffic spike
 * it exists to absorb.
 */
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

let warned = false;
function warnNotConfigured() {
  if (!warned) {
    warned = true;
    console.warn(
      "⚠  UPSTASH_REDIS_REST_URL/TOKEN not set — rate limiting is disabled (fail-open). " +
        "Provision Upstash Redis and set these env vars to enable distributed rate limiting."
    );
  }
}

/** Named limiter configs — different limits per route class, per the security audit. */
const limiters = redis
  ? {
      // Sign-in attempts: generous enough for the real owner to retry, tight against brute forcing.
      auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:auth" }),
      // Admin mutations (create/update/delete): the legitimate admin does these in bursts (drag-reorder etc).
      adminMutation: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:admin-mut" }),
      // Cloudinary signature issuance: each real upload needs exactly one.
      cloudinarySign: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:cloudinary" }),
      // Any other admin read (dashboard, list pages) — generous, just a backstop.
      adminRead: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, "1 m"), prefix: "rl:admin-read" }),
    }
  : null;

export type LimiterName = keyof NonNullable<typeof limiters>;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the caller may retry. */
  retryAfter: number;
}

/** Best-effort client IP, trusting Vercel's forwarded-for header. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Check + consume one request against a named limiter for the given key
 * (usually an IP address or an admin user id). Always resolves — never
 * throws — so a Redis hiccup can't take down the route it's protecting.
 */
export async function rateLimit(name: LimiterName, key: string): Promise<RateLimitResult> {
  if (!limiters) {
    warnNotConfigured();
    return { success: true, limit: 0, remaining: 0, retryAfter: 0 };
  }
  try {
    const { success, limit, remaining, reset } = await limiters[name].limit(key);
    return { success, limit, remaining, retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000)) };
  } catch (err) {
    console.error(`rate-limit check failed for "${name}" — failing open:`, err);
    return { success: true, limit: 0, remaining: 0, retryAfter: 0 };
  }
}

/** Throws if the limit is exceeded — for use in Server Actions, where a thrown error is the natural signal. */
export class RateLimitedError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("Too many requests");
    this.name = "RateLimitedError";
    this.retryAfter = retryAfter;
  }
}

export async function enforceRateLimit(name: LimiterName, key: string) {
  const result = await rateLimit(name, key);
  if (!result.success) throw new RateLimitedError(result.retryAfter);
}
