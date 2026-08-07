import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import { auth, signIn } from "@/auth";
import { GithubIcon } from "@/components/ui/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "GitHub sign-in isn't configured yet. Add AUTH_GITHUB_ID and AUTH_GITHUB_SECRET to your .env file.",
  AccessDenied: "That GitHub account isn't authorized to access this admin panel.",
  Verification: "That sign-in link is invalid or has expired.",
  Default: "Something went wrong while signing in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [session, { error }] = await Promise.all([auth(), searchParams]);
  if (session?.user) redirect("/admin");
  const errorMessage = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default : null;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div className="grid-texture-full absolute inset-0 -z-10 opacity-40" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[50vh]"
        style={{ background: "radial-gradient(50% 50% at 50% 0%, var(--glow), transparent 70%)" }}
      />
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-lift)] sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-2)] font-mono font-semibold">
              AR
            </span>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">Admin access</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Sign in to manage {SITE.name}&apos;s portfolio content.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-left text-sm text-red-500">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/admin" });
            }}
          >
            <button type="submit" className={buttonVariants({ size: "lg", className: "w-full" })}>
              <GithubIcon className="h-5 w-5" />
              Continue with GitHub
            </button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[var(--subtle)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Access is restricted to the site owner.
          </p>
        </div>
      </div>
    </main>
  );
}
