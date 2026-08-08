import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * The authoritative identity check is the GitHub account's stable numeric
 * id (`profile.id`), not the username. Usernames can be renamed by their
 * owner and — after a window — released and claimed by someone else;
 * the numeric id cannot change or be reassigned.
 *
 * ADMIN_GITHUB_ID is configurable via env for portability, but defaults to
 * the owner's known id so the gate is correct out of the box. If both
 * ADMIN_GITHUB_ID and ADMIN_GITHUB_LOGIN are set, both must match — pure
 * defense in depth, the numeric id alone is sufficient and authoritative.
 */
const DEFAULT_ADMIN_GITHUB_ID = "177038875"; // ARKhan8604

const adminGithubId = (process.env.ADMIN_GITHUB_ID?.trim() || DEFAULT_ADMIN_GITHUB_ID);
const adminGithubLogin = process.env.ADMIN_GITHUB_LOGIN?.trim().toLowerCase();

type GithubProfile = { id?: number | string; login?: string };

function isAuthorizedGithubProfile(profile: unknown): boolean {
  const p = profile as GithubProfile | undefined;
  const profileId = p?.id != null ? String(p.id) : undefined;
  const profileLogin = p?.login?.toLowerCase();

  // Fail closed: no id on the profile at all → deny.
  if (!profileId) return false;
  if (profileId !== adminGithubId) return false;
  // If a login allowlist is also configured, it must agree too.
  if (adminGithubLogin && profileLogin !== adminGithubLogin) return false;
  return true;
}

/**
 * Edge-safe auth config (no database adapter). Shared by middleware and the
 * full Node-runtime auth in src/auth.ts. Access is restricted to a single,
 * fixed GitHub account identified by its numeric account id.
 */
export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 }, // 12h — short-lived admin sessions
  useSecureCookies: process.env.NODE_ENV === "production",
  // Vercel's edge network sets Host/X-Forwarded-Host safely (not client-spoofable
  // the way a self-hosted reverse proxy might allow), so trusting it here is
  // correct for this deployment target — Auth.js recommends setting this
  // explicitly rather than relying solely on platform auto-detection.
  trustHost: true,
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider !== "github") return false;
      return isAuthorizedGithubProfile(profile);
    },
    jwt({ token, profile }) {
      // Re-stamp identity on every sign-in; never trust an existing token's
      // claims without this check having run at least once at sign-in time.
      const p = profile as GithubProfile | undefined;
      if (p?.id != null) {
        token.githubId = String(p.id);
        token.login = p.login;
      }
      return token;
    },
    session({ session, token }) {
      // Fail closed: only expose a user on the session if the token carries
      // a verified, matching admin identity.
      const githubId = token.githubId as string | undefined;
      if (!githubId || githubId !== adminGithubId) {
        return { ...session, user: undefined as never, expires: session.expires };
      }
      (session.user as { login?: string; githubId?: string }).login = token.login as string | undefined;
      (session.user as { login?: string; githubId?: string }).githubId = githubId;
      return session;
    },
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdmin) return true;
      // Re-verify identity at the edge too — don't just trust "a session exists".
      const githubId = (auth?.user as { githubId?: string } | undefined)?.githubId;
      return Boolean(auth?.user) && githubId === adminGithubId;
    },
  },
} satisfies NextAuthConfig;

export { adminGithubId };
