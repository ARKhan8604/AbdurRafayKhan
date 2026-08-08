import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminGithubId } from "@/auth.config";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

/**
 * The single source of truth for "is this request the site owner". Every
 * Server Action and every admin-adjacent API route calls this directly —
 * never trust that the UI already checked. Fails closed: any ambiguity
 * (no session, missing/mismatched identity) denies access.
 *
 * Throws UnauthorizedError (no session — equivalent to 401) or
 * ForbiddenError (a session exists but isn't the admin — equivalent to 403).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();

  const githubId = (session.user as { githubId?: string }).githubId;
  if (!githubId || githubId !== adminGithubId) throw new ForbiddenError();

  return session;
}

/** Page/layout variant: redirects to /login instead of throwing. Fails closed on any error. */
export async function requireAdminPage() {
  try {
    return await requireAdmin();
  } catch {
    redirect("/login");
  }
}

/** Route Handler variant: returns a Response to send immediately, or null if the caller is the admin. */
export async function requireAdminResponse(): Promise<Response | null> {
  try {
    await requireAdmin();
    return null;
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
