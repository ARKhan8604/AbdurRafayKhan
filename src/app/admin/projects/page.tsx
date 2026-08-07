import { adminGetProjects } from "@/server/admin-queries";
import { AdminHeader } from "@/components/admin/parts";
import { ProjectList } from "@/components/admin/project-list";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await adminGetProjects();
  return (
    <div>
      <AdminHeader title="Projects" description="Add, edit, reorder, and feature your projects." />
      <ProjectList
        projects={projects.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          featured: p.featured,
          coverImageUrl: p.coverImageUrl,
          images: p.images.map((i) => ({ url: i.url })),
          categories: p.categories.map((c) => ({ name: c.name })),
        }))}
      />
    </div>
  );
}
