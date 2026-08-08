import { NextResponse, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { rateLimit, getClientIpFromRequest } from "@/lib/rate-limit-edge";

/**
 * Runs on (almost) every request. Two independent jobs:
 *  1. Security headers, including CSP (all routes).
 *  2. Admin auth gate + edge-level rate limiting (/admin/* only).
 *
 * CSP deliberately does NOT use a nonce. Nonces require every matched page
 * to render dynamically per-request (Next.js's own docs: "Static
 * optimization and Incremental Static Regeneration (ISR) are disabled").
 * This app explicitly needs public pages to stay ISR-cached and off the
 * database on normal traffic, so script-src accepts 'unsafe-inline'
 * instead — the documented Next.js "static CSP" pattern. This is a
 * deliberate, scoped tradeoff: the XSS audit found no HTML-injection
 * surface it would matter for (all user content renders through React's
 * auto-escaping; the one raw HTML injection point — JSON-LD — is now
 * escaped against script breakout). Everything else stays strict.
 */
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://res.cloudinary.com https://avatars.githubusercontent.com https://opengraph.githubassets.com`,
  `font-src 'self' data:`,
  `connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://api.github.com https://api.cloudinary.com https://vitals.vercel-insights.com${isDev ? " ws:" : ""}`,
  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'self'`,
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), browsing-topics=()"
  );
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return response;
}

const { auth } = NextAuth(authConfig);

export default async function middleware(req: NextRequest) {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  if (isAdmin) {
    // Edge-level flood protection: reject before doing any auth/DB work.
    const ip = getClientIpFromRequest(req);
    const limited = await rateLimit("adminRead", ip);
    if (!limited.success) {
      return applySecurityHeaders(
        new NextResponse("Too many requests", {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfter) },
        })
      );
    }

    // Delegate to the Auth.js edge guard for the actual identity check
    // (re-verifies the session's stored GitHub id, not just "a session exists").
    const authResult = await auth(req as never);
    const isAuthed = Boolean((authResult as { user?: unknown } | null)?.user);
    if (!isAuthed) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login", req.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Run on everything except Next.js internals and static files, so
     * every page gets the security headers — not just /admin. This does
     * NOT affect ISR/static generation: middleware runs at the edge on
     * every request regardless of whether the response it's decorating
     * came from cache or a fresh render.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
