"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertCategory, deleteCategory } from "@/server/actions";

type Category = { id: string; name: string; slug: string };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [, start] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");

  function submit() {
    if (!name.trim()) return toast.error("Name is required");
    start(async () => {
      try {
        await upsertCategory({ id: editing?.id, name });
        toast.success("Saved");
        setName("");
        setEditing(null);
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  function remove(id: string) {
    start(async () => {
      try {
        await deleteCategory(id);
        toast.success("Deleted");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-wrap gap-2">
        {categories.length === 0 && <p className="text-sm text-[var(--muted)]">No categories yet.</p>}
        {categories.map((c) => (
          <Card key={c.id} className="flex items-center gap-2 py-2 pl-4 pr-2">
            <span className="text-sm font-medium">{c.name}</span>
            <span className="font-mono text-xs text-[var(--subtle)]">/{c.slug}</span>
            <button
              onClick={() => {
                setEditing(c);
                setName(c.name);
              }}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)]"
              aria-label="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => remove(c.id)}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="flex h-fit flex-col gap-4 p-5">
        <p className="text-sm font-medium">{editing ? "Edit category" : "Add category"}</p>
        <Field label="Name" hint="The slug is generated automatically.">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Machine Learning" />
        </Field>
        <div className="flex gap-2">
          <Button onClick={submit} size="sm">
            <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
          </Button>
          {editing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(null);
                setName("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
