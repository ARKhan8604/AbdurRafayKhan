"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertEducation, deleteEducation } from "@/server/actions";
import { formatRange } from "@/lib/utils";

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | Date | null;
  endDate: string | Date | null;
  current: boolean;
  description: string | null;
};

function toInput(d?: string | Date | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const empty = {
  id: undefined as string | undefined,
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
};

export function EducationManager({ items }: { items: Education[] }) {
  const [, start] = useTransition();
  const [form, setForm] = useState({ ...empty });
  const editing = Boolean(form.id);

  function submit() {
    if (!form.institution || !form.degree) return toast.error("Institution and degree are required");
    start(async () => {
      try {
        await upsertEducation({
          id: form.id,
          institution: form.institution,
          degree: form.degree,
          field: form.field || null,
          startDate: form.startDate || null,
          endDate: form.current ? null : form.endDate || null,
          current: form.current,
          description: form.description || null,
        });
        toast.success("Saved");
        setForm({ ...empty });
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  function remove(id: string) {
    start(async () => {
      try {
        await deleteEducation(id);
        toast.success("Deleted");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-3">
        {items.length === 0 && <p className="text-sm text-[var(--muted)]">No education entries yet.</p>}
        {items.map((e) => (
          <Card key={e.id} className="flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{e.degree}</p>
              <p className="text-sm text-[var(--muted)]">{e.institution}</p>
              <p className="mt-1 font-mono text-xs text-[var(--subtle)]">
                {formatRange(e.startDate, e.endDate, e.current)}
              </p>
            </div>
            <button
              onClick={() =>
                setForm({
                  id: e.id,
                  institution: e.institution,
                  degree: e.degree,
                  field: e.field ?? "",
                  startDate: toInput(e.startDate),
                  endDate: toInput(e.endDate),
                  current: e.current,
                  description: e.description ?? "",
                })
              }
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(e.id)}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="flex h-fit flex-col gap-4 p-5">
        <p className="text-sm font-medium">{editing ? "Edit entry" : "Add entry"}</p>
        <Field label="Institution">
          <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
        </Field>
        <Field label="Degree">
          <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
        </Field>
        <Field label="Field of study">
          <Input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start">
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End">
            <Input
              type="date"
              value={form.endDate}
              disabled={form.current}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.checked })}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Currently studying
        </label>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <div className="flex gap-2">
          <Button onClick={submit} size="sm">
            <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
          </Button>
          {editing && (
            <Button variant="ghost" size="sm" onClick={() => setForm({ ...empty })}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
