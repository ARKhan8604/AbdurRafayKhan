import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

const allowedLogin = process.env.ADMIN_GITHUB_LOGIN?.toLowerCase();

/**
 * Edge-safe auth config (no database adapter). Shared by middleware and the
 * full Node-runtime auth in src/auth.ts. Access is restricted to a single
 * GitHub account via the signIn callback.
 */
export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider !== "github") return false;
      const login = (profile as { login?: string } | undefined)?.login?.toLowerCase();
      return Boolean(allowedLogin) && login === allowedLogin;
    },
    jwt({ token, profile }) {
      const login = (profile as { login?: string } | undefined)?.login;
      if (login) token.login = login;
      return token;
    },
    session({ session, token }) {
      if (token.login) (session.user as { login?: string }).login = token.login as string;
      return session;
    },
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isAdmin) return Boolean(auth?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
