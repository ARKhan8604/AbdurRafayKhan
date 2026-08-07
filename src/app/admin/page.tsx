import Link from "next/link";
import { FolderGit2, Wrench, Briefcase, GraduationCap, Tags, Link2, Check, X, ArrowRight } from "lucide-react";
import { adminCounts } from "@/server/admin-queries";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function envSet(...keys: string[]) {
  return keys.every((k) => Boolean(process.env[k]));
}

export default async function AdminDashboard() {
  const counts = await adminCounts();

  const stats = [
    { label: "Projects", value: counts.projects, href: "/admin/projects", icon: FolderGit2 },
    { label: "Skills", value: counts.skills, href: "/admin/skills", icon: Wrench },
    { label: "Experience", value: counts.experience, href: "/admin/experience", icon: Briefcase },
    { label: "Education", value: counts.education, href: "/admin/education", icon: GraduationCap },
    { label: "Categories", value: counts.categories, href: "/admin/categories", icon: Tags },
    { label: "Social links", value: counts.socials, href: "/admin/social", icon: Link2 },
  ];

  const checklist = [
    { label: "Database (Neon)", ok: envSet("DATABASE_URL") },
    { label: "GitHub OAuth", ok: envSet("AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET") },
    { label: "Cloudinary uploads", ok: envSet("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET") },
    { label: "GitHub activity token", ok: envSet("GITHUB_TOKEN") },
    { label: "PostHog analytics", ok: envSet("NEXT_PUBLIC_POSTHOG_KEY") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage everything that appears on your public portfolio.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="group flex flex-col gap-3 p-5 transition-colors hover:border-[var(--border-strong)]">
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-[var(--accent)]" />
                <ArrowRight className="h-4 w-4 text-[var(--subtle)] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="text-3xl font-semibold">{s.value}</p>
                <p className="text-sm text-[var(--muted)]">{s.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-medium">Setup checklist</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  c.ok ? "bg-emerald-500/15 text-emerald-500" : "bg-[var(--surface-2)] text-[var(--subtle)]"
                }`}
              >
                {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <span className={c.ok ? "text-[var(--text)]" : "text-[var(--muted)]"}>{c.label}</span>
              <span className="ml-auto text-xs text-[var(--subtle)]">{c.ok ? "Configured" : "Optional / pending"}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
