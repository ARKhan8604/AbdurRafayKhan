"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertSkill, deleteSkill } from "@/server/actions";

type Skill = { id: string; name: string; group: string; level: number | null };

export function SkillManager({ skills }: { skills: Skill[] }) {
  const [, start] = useTransition();
  const [editing, setEditing] = useState<Skill | null>(null);
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");

  const groups = Array.from(new Set(skills.map((s) => s.group)));
  const grouped = groups.map((g) => ({ group: g, items: skills.filter((s) => s.group === g) }));

  function submit() {
    if (!name.trim() || !group.trim()) return toast.error("Name and group are required");
    start(async () => {
      try {
        await upsertSkill({ id: editing?.id, name, group });
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
        await deleteSkill(id);
        toast.success("Deleted");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-6">
        {grouped.length === 0 && <p className="text-sm text-[var(--muted)]">No skills yet.</p>}
        {grouped.map(({ group: g, items }) => (
          <div key={g} className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--subtle)]">{g}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] py-1.5 pl-3 pr-1.5 text-sm"
                >
                  {s.name}
                  <button
                    onClick={() => {
                      setEditing(s);
                      setName(s.name);
                      setGroup(s.group);
                    }}
                    className="rounded p-1 text-[var(--muted)] hover:text-[var(--text)]"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="rounded p-1 text-[var(--muted)] hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="flex h-fit flex-col gap-4 p-5">
        <p className="text-sm font-medium">{editing ? "Edit skill" : "Add skill"}</p>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rust" />
        </Field>
        <Field label="Group" hint="e.g. Languages, Frameworks & Libraries, AI / ML, Tools & Platforms">
          <Input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Languages" list="skill-groups" />
          <datalist id="skill-groups">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
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
                setGroup("");
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
