"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SocialIcon } from "@/components/ui/social-icon";
import { upsertSocial, deleteSocial } from "@/server/actions";

type Social = { id: string; platform: string; url: string; icon: string | null };
const ICONS = ["github", "linkedin", "mail", "twitter", "instagram", "globe"];

export function SocialManager({ socials }: { socials: Social[] }) {
  const [, start] = useTransition();
  const [editing, setEditing] = useState<Social | null>(null);
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("globe");

  function edit(s: Social) {
    setEditing(s);
    setPlatform(s.platform);
    setUrl(s.url);
    setIcon(s.icon ?? "globe");
  }
  function reset() {
    setEditing(null);
    setPlatform("");
    setUrl("");
    setIcon("globe");
  }

  function submit() {
    if (!platform || !url) return toast.error("Platform and URL are required");
    start(async () => {
      try {
        await upsertSocial({ id: editing?.id, platform, url, icon });
        toast.success("Saved");
        reset();
      } catch {
        toast.error("Couldn't save");
      }
    });
  }

  function remove(id: string) {
    start(async () => {
      try {
        await deleteSocial(id);
        toast.success("Deleted");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-3">
        {socials.length === 0 && <p className="text-sm text-[var(--muted)]">No social links yet.</p>}
        {socials.map((s) => (
          <Card key={s.id} className="flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
              <SocialIcon name={s.icon ?? s.platform} className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{s.platform}</p>
              <p className="truncate text-xs text-[var(--subtle)]">{s.url}</p>
            </div>
            <button onClick={() => edit(s)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => remove(s.id)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-500" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>

      <Card className="flex h-fit flex-col gap-4 p-5">
        <p className="text-sm font-medium">{editing ? "Edit link" : "Add link"}</p>
        <Field label="Platform">
          <Input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="LinkedIn" />
        </Field>
        <Field label="URL">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Icon">
          <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
            {ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-2">
          <Button onClick={submit} size="sm">
            <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
          </Button>
          {editing && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
