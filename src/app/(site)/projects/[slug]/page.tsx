import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Users,
  Target,
  Lightbulb,
  Mountain,
  Trophy,
  FileText,
} from "lucide-react";
import { getProjects, getProjectBySlug } from "@/server/queries";
import { SITE } from "@/lib/constants";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCover } from "@/components/projects/project-cover";
import { ProjectGallery } from "@/components/projects/project-gallery";
import { ProjectCTA } from "@/components/projects/project-cta";
import { GithubIcon } from "@/components/ui/brand-icons";
import { safeJsonLd } from "@/lib/utils";
import type { ProjectView } from "@/types/content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${SITE.url}/projects/${project.slug}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: project.title, description: project.description },
  };
}

const NARRATIVE: { key: keyof ProjectView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: FileText },
  { key: "problem", label: "The Problem", icon: Target },
  { key: "solution", label: "The Solution", icon: Lightbulb },
  { key: "challenges", label: "Challenges", icon: Mountain },
  { key: "outcome", label: "Outcome", icon: Trophy },
];

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await getProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${SITE.url}/projects/${project.slug}`,
    author: { "@type": "Person", name: SITE.name },
    keywords: project.technologies.join(", "),
  };

  return (
    <article className="pb-24 pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <Container>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>

        {/* Header */}
        <Reveal className="mt-8 flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs text-[var(--muted)]"
              >
                {c.name}
              </span>
            ))}
            {project.year && <span className="font-mono text-xs text-[var(--subtle)]">{project.year}</span>}
          </div>
          <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-[var(--muted)]">
            {project.longDescription ?? project.description}
          </p>
          <ProjectCTA liveUrl={project.liveUrl} githubUrl={project.githubUrl} />
        </Reveal>

        {/* Cover */}
        <Reveal delay={0.05} className="mt-12">
          <div
            className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--border)] shadow-[var(--shadow-lift)]"
            style={{ viewTransitionName: `project-cover-${project.slug}` } as React.CSSProperties}
          >
            <ProjectCover project={project} sizes="100vw" priority />
          </div>
        </Reveal>

        {/* Body */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          {/* Narrative */}
          <div className="flex flex-col gap-12">
            {NARRATIVE.map(({ key, label, icon: Icon }) => {
              const value = project[key] as string | null | undefined;
              if (!value) return null;
              return (
                <Reveal key={key as string} className="flex flex-col gap-4">
                  <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </h2>
                  {value.split("\n\n").map((para, i) => (
                    <p key={i} className="text-pretty text-[17px] leading-relaxed text-[var(--muted)]">
                      {para}
                    </p>
                  ))}
                </Reveal>
              );
            })}

            {/* Gallery */}
            {project.images.length > 0 && (
              <Reveal className="flex flex-col gap-5">
                <h2 className="text-2xl font-semibold tracking-tight">Gallery</h2>
                <ProjectGallery images={project.images} title={project.title} />
              </Reveal>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:h-fit">
            {project.role && (
              <MetaBlock label="My Role">
                <p className="text-[var(--text)]">{project.role}</p>
              </MetaBlock>
            )}
            <MetaBlock label="Technologies">
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono text-[11px] text-[var(--muted)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </MetaBlock>
            {project.team.length > 0 && (
              <MetaBlock label="Team">
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs font-medium text-[var(--accent)]">
                      AR
                    </span>
                    <span className="text-sm">
                      <span className="text-[var(--text)]">{SITE.name}</span>
                      <span className="block text-xs text-[var(--subtle)]">{project.role ?? "Developer"}</span>
                    </span>
                  </li>
                  {project.team.map((m) => (
                    <li key={m.name} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]">
                        <Users className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm">
                        {m.link ? (
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text)] hover:text-[var(--accent)]">
                            {m.name}
                          </a>
                        ) : (
                          <span className="text-[var(--text)]">{m.name}</span>
                        )}
                        {m.role && <span className="block text-xs text-[var(--subtle)]">{m.role}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </MetaBlock>
            )}
            {(project.liveUrl || project.githubUrl) && (
              <MetaBlock label="Links">
                <div className="flex flex-col gap-2">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]">
                      <ExternalLink className="h-4 w-4" /> Live demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]">
                      <GithubIcon className="h-4 w-4" /> Source code
                    </a>
                  )}
                </div>
              </MetaBlock>
            )}
          </aside>
        </div>

        {/* Prev / next */}
        <div className="mt-20 grid gap-4 border-t border-[var(--border)] pt-10 sm:grid-cols-2">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="group flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)]">
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--subtle)]">
                <ArrowLeft className="h-3.5 w-3.5" /> Previous
              </span>
              <span className="font-medium transition-colors group-hover:text-[var(--accent)]">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/projects/${next.slug}`} className="group flex flex-col items-end gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-right transition-colors hover:border-[var(--border-strong)] sm:col-start-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--subtle)]">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium transition-colors group-hover:text-[var(--accent)]">{next.title}</span>
            </Link>
          )}
        </div>
      </Container>
    </article>
  );
}

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--subtle)]">{label}</p>
      {children}
    </div>
  );
}
