"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { CategoryView, ProjectView } from "@/types/content";
import { ProjectCard } from "./project-card";
import { cn } from "@/lib/utils";

export function ProjectsExplorer({
  projects,
  categories,
  initialCategory = "all",
  emphasizeFirst = true,
}: {
  projects: ProjectView[];
  categories: CategoryView[];
  initialCategory?: string;
  emphasizeFirst?: boolean;
}) {
  const [active, setActive] = useState(initialCategory);
  const reduce = useReducedMotion();

  // Only show category pills that actually have projects in this set.
  const usableCategories = useMemo(() => {
    const present = new Set(projects.flatMap((p) => p.categories.map((c) => c.slug)));
    return categories.filter((c) => present.has(c.slug));
  }, [projects, categories]);

  const filtered = useMemo(() => {
    if (active === "all") return projects;
    return projects.filter((p) => p.categories.some((c) => c.slug === active));
  }, [projects, active]);

  return (
    <div className="flex flex-col gap-8">
      {/* filter pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill label="All" count={projects.length} active={active === "all"} onClick={() => setActive("all")} />
        {usableCategories.map((c) => {
          const count = projects.filter((p) => p.categories.some((x) => x.slug === c.slug)).length;
          return (
            <FilterPill
              key={c.id}
              label={c.name}
              count={count}
              active={active === c.slug}
              onClick={() => setActive(c.slug)}
            />
          );
        })}
      </div>

      {/* grid */}
      <LayoutGroup>
        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => {
              const big = emphasizeFirst && i === 0;
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className={cn(big && "md:col-span-2 lg:col-span-2")}
                >
                  <ProjectCard project={project} featured={big} className="h-full" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-[var(--muted)]">No projects in this category yet.</p>
      )}
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
      )}
      aria-pressed={active}
    >
      {label}
      <span className={cn("font-mono text-xs", active ? "text-[var(--accent)]" : "text-[var(--subtle)]")}>{count}</span>
    </button>
  );
}
