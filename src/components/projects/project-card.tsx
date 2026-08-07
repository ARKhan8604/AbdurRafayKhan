"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink, Users } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import type { ProjectView } from "@/types/content";
import { ProjectCover } from "./project-cover";
import { StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";

export function ProjectCard({
  project,
  featured = false,
  className,
}: {
  project: ProjectView;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      onClick={() => capture("project_opened", { slug: project.slug, from: "grid" })}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-lift)]",
        className
      )}
    >
      {/* cover */}
      <div className={cn("relative overflow-hidden", featured ? "aspect-[16/10]" : "aspect-[16/11]")}>
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ viewTransitionName: `project-cover-${project.slug}` } as React.CSSProperties}
        >
          <ProjectCover
            project={project}
            sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </div>
        <div className="absolute left-4 top-4 z-10">
          <StatusBadge status={project.status} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent opacity-60" />
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-semibold tracking-tight", featured ? "text-xl sm:text-2xl" : "text-lg")}>
            {project.title}
          </h3>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[var(--muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{project.description}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {project.technologies.slice(0, featured ? 6 : 4).map((t) => (
            <span
              key={t}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[11px] text-[var(--subtle)]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--subtle)]">
          {project.categories[0] && <span className="text-[var(--muted)]">{project.categories[0].name}</span>}
          {project.year && <span>· {project.year}</span>}
          <span className="ml-auto flex items-center gap-3">
            {project.team.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {project.team.length + 1}
              </span>
            )}
            {project.githubUrl && <GithubIcon className="h-3.5 w-3.5" />}
            {project.liveUrl && <ExternalLink className="h-3.5 w-3.5" />}
          </span>
        </div>
      </div>
    </Link>
  );
}
