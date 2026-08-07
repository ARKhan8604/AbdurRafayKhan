"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical, Star, Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/content";
import { createProject, deleteProject, reorderProjects, toggleFeatured } from "@/server/actions";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  featured: boolean;
  coverImageUrl: string | null;
  images: { url: string }[];
  categories: { name: string }[];
};

export function ProjectList({ projects }: { projects: Row[] }) {
  const [rows, setRows] = useState(projects);
  const [, start] = useTransition();
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next);
    start(async () => {
      try {
        await reorderProjects(next.map((r) => r.id));
      } catch {
        toast.error("Couldn't save order");
      }
    });
  }

  function newProject() {
    start(async () => {
      try {
        const id = await createProject({
          title: "Untitled project",
          description: "A short one-line description.",
          status: "IN_PROGRESS",
        });
        router.push(`/admin/projects/${id}`);
      } catch {
        toast.error("Couldn't create project");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setRows((r) => r.filter((x) => x.id !== id));
    start(async () => {
      try {
        await deleteProject(id);
        toast.success("Project deleted");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  function setFeatured(id: string, value: boolean) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, featured: value } : x)));
    start(async () => {
      try {
        await toggleFeatured(id, value);
      } catch {
        toast.error("Couldn't update");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={newProject} size="sm">
          <Plus className="h-4 w-4" /> New project
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No projects yet. Create your first one.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  onFeatured={setFeatured}
                  onDelete={remove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableRow({
  row,
  onFeatured,
  onDelete,
}: {
  row: Row;
  onFeatured: (id: string, v: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const cover = row.coverImageUrl ?? row.images[0]?.url ?? null;
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("flex items-center gap-3 p-3", isDragging && "z-10 shadow-[var(--shadow-lift)]")}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-[var(--subtle)] hover:text-[var(--text)] active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
        {cover && <Image src={cover} alt="" fill className="object-cover" sizes="64px" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{row.title}</p>
        <p className="truncate text-xs text-[var(--subtle)]">
          {row.categories.map((c) => c.name).join(" · ") || "Uncategorized"}
        </p>
      </div>

      <StatusBadge status={row.status} className="hidden sm:inline-flex" />

      <button
        onClick={() => onFeatured(row.id, !row.featured)}
        className={cn(
          "rounded-lg p-2 transition-colors",
          row.featured ? "text-amber-500" : "text-[var(--subtle)] hover:text-[var(--text)]"
        )}
        aria-label="Toggle featured"
        title={row.featured ? "Featured" : "Not featured"}
      >
        <Star className={cn("h-4 w-4", row.featured && "fill-current")} />
      </button>

      <a
        href={`/projects/${row.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
        aria-label="Preview"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
      <Link
        href={`/admin/projects/${row.id}`}
        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={() => onDelete(row.id)}
        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-500"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </Card>
  );
}
