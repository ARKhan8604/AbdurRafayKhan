import type { Metadata } from "next";
import { getProjects, getCategories } from "@/server/queries";
import { Section } from "@/components/ui/section";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A complete catalog of my work — AI apps, full-stack products, business sites, and UI/UX — filterable by category.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, projects, categories] = await Promise.all([
    searchParams,
    getProjects(),
    getCategories(),
  ]);

  return (
    <div className="pt-24">
      <Section
        eyebrow="Portfolio"
        title="Everything I've built"
        description="From AI-powered apps to production sites for real clients. Filter by category, or open any project for the full case study."
      >
        <ProjectsExplorer
          projects={projects}
          categories={categories}
          initialCategory={category ?? "all"}
          emphasizeFirst={false}
        />
      </Section>
    </div>
  );
}
