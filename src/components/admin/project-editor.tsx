"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Plus, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ProjectGalleryManager } from "@/components/admin/project-gallery-manager";
import { updateProject, deleteProject, setProjectTeam } from "@/server/actions";
import type { ProjectStatus } from "@/types/content";

const STATUSES: ProjectStatus[] = ["LIVE", "IN_PROGRESS", "COMPLETED", "CONCEPT", "ARCHIVED"];

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string | null;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  challenges: string | null;
  outcome: string | null;
  role: string | null;
  year: string | null;
  technologies: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  coverImageUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  categories: { id: string }[];
  images: { id: string; url: string; alt: string | null }[];
  team: { name: string; role: string | null; link: string | null }[];
};

export function ProjectEditor({
  project,
  categories,
}: {
  project: Project;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [f, setF] = useState({
    title: project.title,
    slug: project.slug,
    description: project.description,
    longDescription: project.longDescription ?? "",
    overview: project.overview ?? "",
    problem: project.problem ?? "",
    solution: project.solution ?? "",
    challenges: project.challenges ?? "",
    outcome: project.outcome ?? "",
    role: project.role ?? "",
    year: project.year ?? "",
    technologies: project.technologies.join(", "),
    githubUrl: project.githubUrl ?? "",
    liveUrl: project.liveUrl ?? "",
    status: project.status,
    featured: project.featured,
  });
  const [cover, setCover] = useState(project.coverImageUrl);
  const [catIds, setCatIds] = useState<string[]>(project.categories.map((c) => c.id));
  const [team, setTeam] = useState(project.team.map((t) => ({ name: t.name, role: t.role ?? "", link: t.link ?? "" })));

  function update<K extends keyof typeof f>(key: K, value: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCat(id: string) {
    setCatIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (!f.title || !f.description) return toast.error("Title and description are required");
    start(async () => {
      try {
        await updateProject(project.id, {
          title: f.title,
          slug: f.slug,
          description: f.description,
          longDescription: f.longDescription || null,
          overview: f.overview || null,
          problem: f.problem || null,
          solution: f.solution || null,
          challenges: f.challenges || null,
          outcome: f.outcome || null,
          role: f.role || null,
          year: f.year || null,
          technologies: f.technologies.split(",").map((t) => t.trim()).filter(Boolean),
          githubUrl: f.githubUrl || null,
          liveUrl: f.liveUrl || null,
          coverImageUrl: cover,
          status: f.status,
          featured: f.featured,
          categoryIds: catIds,
        });
        await setProjectTeam(
          project.id,
          team.filter((t) => t.name.trim()).map((t) => ({ name: t.name, role: t.role || null, link: t.link || null }))
        );
        toast.success("Project saved");
        router.refresh();
      } catch {
        toast.error("Couldn't save — check your database connection");
      }
    });
  }

  function remove() {
    if (!confirm("Delete this project permanently?")) return;
    start(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted");
        router.push("/admin/projects");
      } catch {
        toast.error("Couldn't delete");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      {/* Main */}
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-5 p-6">
          <p className="text-sm font-medium">Basics</p>
          <Field label="Title">
            <Input value={f.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug" hint="Leave blank to auto-generate from title.">
              <Input value={f.slug} onChange={(e) => update("slug", e.target.value)} />
            </Field>
            <Field label="Year">
              <Input value={f.year} onChange={(e) => update("year", e.target.value)} placeholder="2025" />
            </Field>
          </div>
          <Field label="Short description" hint="One line, shown on cards.">
            <Input value={f.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
          <Field label="Long description" hint="Intro paragraph on the case-study page.">
            <Textarea value={f.longDescription} onChange={(e) => update("longDescription", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="My role">
              <Input value={f.role} onChange={(e) => update("role", e.target.value)} placeholder="Full-Stack Developer" />
            </Field>
            <Field label="Status">
              <Select value={f.status} onChange={(e) => update("status", e.target.value as ProjectStatus)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Technologies" hint="Comma-separated.">
            <Input value={f.technologies} onChange={(e) => update("technologies", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Live URL">
              <Input value={f.liveUrl} onChange={(e) => update("liveUrl", e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="GitHub URL">
              <Input value={f.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} placeholder="https://github.com/…" />
            </Field>
          </div>
        </Card>

        <Card className="flex flex-col gap-5 p-6">
          <p className="text-sm font-medium">Case study</p>
          {(["overview", "problem", "solution", "challenges", "outcome"] as const).map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
              <Textarea value={f[k]} onChange={(e) => update(k, e.target.value)} />
            </Field>
          ))}
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <p className="text-sm font-medium">Gallery</p>
          <ProjectGalleryManager projectId={project.id} images={project.images} />
        </Card>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-3 p-5">
          <button
            onClick={save}
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-fg)] hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {pending ? "Saving…" : "Save project"}
          </button>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Featured on homepage
          </label>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <Label>Cover image</Label>
          <ImageUploader value={cover} onChange={setCover} folder={`projects/${project.id}`} kind="image" label="Upload cover" />
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <Label>Categories</Label>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={catIds.includes(c.id)}
                  onChange={() => toggleCat(c.id)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {c.name}
              </label>
            ))}
            {categories.length === 0 && <p className="text-xs text-[var(--subtle)]">No categories — add some first.</p>}
          </div>
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <Label>Team members</Label>
          <p className="text-xs text-[var(--subtle)]">You are shown automatically. Add collaborators here.</p>
          {team.map((m, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] p-3">
              <Input
                placeholder="Name"
                value={m.name}
                onChange={(e) => setTeam((t) => t.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <Input
                placeholder="Role (e.g. Co-founder)"
                value={m.role}
                onChange={(e) => setTeam((t) => t.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
              />
              <Input
                placeholder="Link (optional)"
                value={m.link}
                onChange={(e) => setTeam((t) => t.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))}
              />
              <button
                onClick={() => setTeam((t) => t.filter((_, j) => j !== i))}
                className="inline-flex items-center gap-1 self-start text-xs text-[var(--muted)] hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setTeam((t) => [...t, { name: "", role: "", link: "" }])}>
            <Plus className="h-4 w-4" /> Add member
          </Button>
        </Card>

        <Card className="p-5">
          <button onClick={remove} className="inline-flex items-center gap-2 text-sm text-red-500 hover:underline">
            <Trash2 className="h-4 w-4" /> Delete project
          </button>
        </Card>
      </div>
    </div>
  );
}
