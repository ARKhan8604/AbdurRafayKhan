import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut, AlertTriangle } from "lucide-react";
import { auth, signOut } from "@/auth";
import { getDbStatus } from "@/server/admin-queries";
import { AdminNav } from "@/components/admin/admin-nav";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const dbReady = await getDbStatus();

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="border-b border-[var(--border)] lg:sticky lg:top-0 lg:h-dvh lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-5">
            <Link href="/admin" className="flex items-center gap-2.5 px-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] font-mono text-sm font-semibold">
                AR
              </span>
              <div className="leading-tight">
                <p className="text-sm font-medium">Portfolio CMS</p>
                <p className="text-xs text-[var(--subtle)]">{session.user.name ?? "Admin"}</p>
              </div>
            </Link>

            <div className="mt-6 flex-1 overflow-y-auto">
              <AdminNav />
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
              <Link
                href="/"
                target="_blank"
                className={buttonVariants({ variant: "secondary", size: "sm", className: "w-full" })}
              >
                <ExternalLink className="h-4 w-4" /> View site
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          {!dbReady && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Database not connected</p>
                <p className="mt-1 text-amber-600/80 dark:text-amber-400/80">
                  Set <code className="font-mono">DATABASE_URL</code> and run{" "}
                  <code className="font-mono">npm run db:push &amp;&amp; npm run db:seed</code>. Saving will fail until
                  the database is reachable.
                </p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
