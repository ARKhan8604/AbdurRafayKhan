"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  Brain,
  Layers,
  Briefcase,
  Palette,
  GraduationCap,
  GitFork,
  Compass,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import type { CategoryView } from "@/types/content";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ai: Brain,
  "full-stack": Layers,
  "business-websites": Briefcase,
  "ui-ux": Palette,
  "university-projects": GraduationCap,
  "open-source": GitFork,
};

export function ExploreDropdown({ categories }: { categories: CategoryView[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => {
            if (!v) capture("explore_menu_opened");
            return !v;
          });
        }}
        className={cn(
          "group inline-flex h-12 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)]/70 px-6 text-sm font-medium text-[var(--text)] backdrop-blur transition-colors hover:border-[var(--accent)]",
          open && "border-[var(--accent)]"
        )}
      >
        <Compass className="h-4 w-4 text-[var(--accent)]" />
        Explore My Work
        <ChevronDown className={cn("h-4 w-4 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="absolute left-1/2 z-50 mt-3 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-[var(--shadow-lift)] backdrop-blur-xl"
          >
            <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--subtle)]">
              Project categories
            </p>
            {categories.map((c) => {
              const Icon = ICONS[c.slug] ?? Layers;
              return (
                <Link
                  key={c.id}
                  href={`/projects?category=${c.slug}`}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 font-medium">{c.name}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
