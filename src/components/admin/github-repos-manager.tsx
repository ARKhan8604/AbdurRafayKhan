"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { GripVertical, X, Plus, Save, Star, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateSettings } from "@/server/actions";
import { cn } from "@/lib/utils";

type Repo = { name: string; description: string | null; language: string | null };

export function GithubReposManager({
  initialSelected,
  available,
}: {
  initialSelected: string[];
  available: Repo[];
}) {
  const [pending, start] = useTransition();
  // keep only names that still exist on GitHub, preserve saved order
  const [selected, setSelected] = useState<string[]>(
    initialSelected.filter((n) => available.some((r) => r.name.toLowerCase() === n.toLowerCase()))
  );
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  const selectedSet = new Set(selected.map((s) => s.toLowerCase()));
  const remaining = available.filter((r) => !selectedSet.has(r.name.toLowerCase()));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setSelected((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function add(name: string) {
    setSelected((prev) => [...prev, name]);
  }
  function remove(name: string) {
    setSelected((prev) => prev.filter((n) => n !== name));
  }

  function save() {
    start(async () => {
      try {
        await updateSettings({ featuredRepos: selected });
        toast.success(selected.length ? "Featured repos saved" : "Now showing all public repos");
      } catch {
        toast.error("Couldn't save — check your database connection");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-start gap-3 p-4 text-sm text-[var(--muted)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <p>
          Choose exactly which repos appear in the GitHub Activity section, and drag to set their order. Leave the
          list empty to automatically show your most recently updated public repos instead.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Selected / featured */}
        <Card className="flex flex-col gap-3 p-5">
          <p className="text-sm font-medium">
            Featured <span className="text-[var(--subtle)]">({selected.length})</span>
          </p>
          {selected.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--subtle)]">
              None selected — all public repos will show automatically.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
              <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {selected.map((name) => (
                    <SortableRepoRow key={name} name={name} onRemove={() => remove(name)} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </Card>

        {/* Available */}
        <Card className="flex flex-col gap-3 p-5">
          <p className="text-sm font-medium">
            Available <span className="text-[var(--subtle)]">({remaining.length})</span>
          </p>
          {remaining.length === 0 ? (
            <p className="text-xs text-[var(--subtle)]">Every repo is featured.</p>
          ) : (
            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
              {remaining.map((r) => (
                <button
                  key={r.name}
                  onClick={() => add(r.name)}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition-colors hover:border-[var(--accent)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-sm">{r.name}</span>
                    {r.language && <span className="text-xs text-[var(--subtle)]">{r.language}</span>}
                  </span>
                  <Plus className="h-4 w-4 shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)]" />
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Button onClick={save} disabled={pending}>
          <Save className="h-4 w-4" /> {pending ? "Saving…" : "Save featured repos"}
        </Button>
      </div>
    </div>
  );
}

function SortableRepoRow({ name, onRemove }: { name: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: name });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3",
        isDragging && "z-10 shadow-[var(--shadow-lift)]"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-[var(--subtle)] hover:text-[var(--text)] active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500" />
      <span className="flex-1 truncate font-mono text-sm">{name}</span>
      <button onClick={onRemove} className="rounded-lg p-1.5 text-[var(--muted)] hover:text-red-500" aria-label="Remove">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
