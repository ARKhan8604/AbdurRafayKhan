import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGetProject, adminGetCategories } from "@/server/admin-queries";
import { ProjectEditor } from "@/components/admin/project-editor";

export const dynamic = "force-dynamic";

export default async function AdminProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([adminGetProject(id), adminGetCategories()]);
  if (!project) notFound();

  return (
    <div>
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <ProjectEditor
        project={{
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          longDescription: project.longDescription,
          overview: project.overview,
          problem: project.problem,
          solution: project.solution,
          challenges: project.challenges,
          outcome: project.outcome,
          role: project.role,
          year: project.year,
          technologies: project.technologies,
          githubUrl: project.githubUrl,
          liveUrl: project.liveUrl,
          coverImageUrl: project.coverImageUrl,
          status: project.status,
          featured: project.featured,
          categories: project.categories.map((c) => ({ id: c.id })),
          images: project.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
          team: project.team.map((t) => ({ name: t.name, role: t.role, link: t.link })),
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
