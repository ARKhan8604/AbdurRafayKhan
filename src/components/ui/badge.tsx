import * as React from "react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/content";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}

const STATUS_META: Record<ProjectStatus, { label: string; dot: string; text?: string }> = {
  LIVE: { label: "Live", dot: "bg-emerald-500", text: "text-emerald-500" },
  IN_PROGRESS: { label: "In Progress", dot: "bg-amber-500", text: "text-amber-500" },
  COMPLETED: { label: "Completed", dot: "bg-sky-500", text: "text-sky-500" },
  CONCEPT: { label: "Concept", dot: "bg-violet-500", text: "text-violet-500" },
  ARCHIVED: { label: "Archived", dot: "bg-zinc-500", text: "text-zinc-500" },
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-2.5 py-1 text-xs font-medium backdrop-blur",
        meta.text,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "LIVE" && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", meta.dot)} />
        )}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", meta.dot)} />
      </span>
      {meta.label}
    </span>
  );
}
