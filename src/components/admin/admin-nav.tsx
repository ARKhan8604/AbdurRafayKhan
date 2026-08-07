"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  User,
  FileText,
  Link2,
  FolderGit2,
  Tags,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/hero", label: "Hero", icon: Sparkles },
  { href: "/admin/about", label: "About", icon: User },
  { href: "/admin/profile", label: "Profile & Résumé", icon: FileText },
  { href: "/admin/social", label: "Social Links", icon: Link2 },
  { href: "/admin/github", label: "GitHub", icon: GithubIcon },
  { href: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-[var(--surface-2)] text-[var(--text)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            )}
          >
            <l.icon className={cn("h-4 w-4", active && "text-[var(--accent)]")} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
