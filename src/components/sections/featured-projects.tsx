import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryView, ProjectView } from "@/types/content";
import { Section } from "@/components/ui/section";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { buttonVariants } from "@/components/ui/button";

export function FeaturedProjects({
  projects,
  categories,
}: {
  projects: ProjectView[];
  categories: CategoryView[];
}) {
  return (
    <Section
      id="projects"
      eyebrow="Selected Work"
      title="Featured projects"
      description="A few things I've designed and built — from AI-powered apps to production sites for real clients. Filter by category, or open any project for the full story."
    >
      <ProjectsExplorer projects={projects} categories={categories} />

      <div className="mt-12 flex justify-center">
        <Link href="/projects" className={buttonVariants({ variant: "secondary", size: "md", className: "group" })}>
          View all projects
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Section>
  );
}
