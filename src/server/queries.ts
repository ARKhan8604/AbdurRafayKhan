import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  SETTINGS,
  SOCIALS,
  CATEGORIES,
  PROJECTS,
  SKILLS,
  EXPERIENCE,
  EDUCATION,
  type SeedProject,
} from "@/lib/content";
import type {
  CategoryView,
  EducationView,
  ExperienceView,
  ProjectView,
  SettingsView,
  SkillView,
  SocialView,
} from "@/types/content";

/**
 * Every getter tries the database first and falls back to the shared static
 * content on any error (e.g. DB not yet configured). This lets the whole site
 * render before Neon is connected, then switch to live data automatically.
 */

let warned = false;
function fallbackNotice() {
  if (!warned) {
    warned = true;
    console.warn(
      "⚠  Database unavailable — serving fallback content from src/lib/content.ts. Set DATABASE_URL and run `npm run db:push && npm run db:seed` to go live."
    );
  }
}

// ---------- fallback builders ---------- //
function fallbackCategories(): CategoryView[] {
  return CATEGORIES.map((c, i) => ({ id: c.slug, ...c, order: c.order ?? i }));
}

function fallbackProject(p: SeedProject): ProjectView {
  const cats = fallbackCategories();
  return {
    id: p.slug,
    slug: p.slug,
    title: p.title,
    description: p.description,
    longDescription: p.longDescription ?? null,
    overview: p.overview ?? null,
    problem: p.problem ?? null,
    solution: p.solution ?? null,
    challenges: p.challenges ?? null,
    outcome: p.outcome ?? null,
    role: p.role ?? null,
    year: p.year ?? null,
    technologies: p.technologies,
    githubUrl: p.githubUrl ?? null,
    liveUrl: p.liveUrl ?? null,
    coverImageUrl: null,
    status: p.status,
    featured: p.featured,
    order: p.order,
    categories: p.categorySlugs
      .map((s) => cats.find((c) => c.slug === s))
      .filter(Boolean) as CategoryView[],
    images: [],
    team: (p.team ?? []).map((t) => ({ name: t.name, role: t.role, link: t.link })),
  };
}

function fallbackProjects(): ProjectView[] {
  return [...PROJECTS].sort((a, b) => a.order - b.order).map(fallbackProject);
}

// ---------- prisma → view mappers ---------- //
type PrismaProjectWithRelations = {
  id: string;
  slug: string;
  title: string;
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
  status: ProjectView["status"];
  featured: boolean;
  order: number;
  categories: { id: string; name: string; slug: string; order: number }[];
  images: { url: string; alt: string | null }[];
  team: { name: string; role: string | null; link: string | null }[];
};

function mapProject(p: PrismaProjectWithRelations): ProjectView {
  return {
    ...p,
    categories: p.categories.sort((a, b) => a.order - b.order),
    images: p.images,
    team: p.team,
  };
}

const projectInclude = {
  categories: true,
  images: { orderBy: { order: "asc" as const } },
  team: { orderBy: { order: "asc" as const } },
};

// ---------- public getters ---------- //
export const getSettings = cache(async (): Promise<SettingsView> => {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!s) return { ...SETTINGS };
    return {
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      heroTagline: s.heroTagline,
      roles: s.roles,
      aboutHeading: s.aboutHeading,
      aboutBody: s.aboutBody,
      profileImageUrl: s.profileImageUrl,
      resumeUrl: s.resumeUrl,
      location: s.location,
      email: s.email,
      availableForWork: s.availableForWork,
      featuredRepos: s.featuredRepos,
    };
  } catch {
    fallbackNotice();
    return { ...SETTINGS };
  }
});

export const getSocials = cache(async (): Promise<SocialView[]> => {
  try {
    const rows = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
    if (!rows.length) return SOCIALS.map((s, i) => ({ id: String(i), ...s }));
    return rows;
  } catch {
    fallbackNotice();
    return SOCIALS.map((s, i) => ({ id: String(i), ...s }));
  }
});

export const getCategories = cache(async (): Promise<CategoryView[]> => {
  try {
    const rows = await prisma.category.findMany({ orderBy: { order: "asc" } });
    if (!rows.length) return fallbackCategories();
    return rows;
  } catch {
    fallbackNotice();
    return fallbackCategories();
  }
});

export const getProjects = cache(async (): Promise<ProjectView[]> => {
  try {
    const rows = await prisma.project.findMany({
      orderBy: { order: "asc" },
      include: projectInclude,
    });
    if (!rows.length) return fallbackProjects();
    return rows.map(mapProject);
  } catch {
    fallbackNotice();
    return fallbackProjects();
  }
});

export const getFeaturedProjects = cache(async (): Promise<ProjectView[]> => {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  return featured.length ? featured : all.slice(0, 4);
});

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectView | null> => {
  try {
    const row = await prisma.project.findUnique({ where: { slug }, include: projectInclude });
    if (row) return mapProject(row);
  } catch {
    fallbackNotice();
  }
  return fallbackProjects().find((p) => p.slug === slug) ?? null;
});

export const getSkills = cache(async (): Promise<SkillView[]> => {
  try {
    const rows = await prisma.skill.findMany({ orderBy: { order: "asc" } });
    if (!rows.length) throw new Error("empty");
    return rows;
  } catch {
    fallbackNotice();
    return SKILLS.map((s, i) => ({ id: String(i), ...s, level: null, order: i }));
  }
});

export const getExperience = cache(async (): Promise<ExperienceView[]> => {
  try {
    const rows = await prisma.experience.findMany({ orderBy: { order: "asc" } });
    if (!rows.length) throw new Error("empty");
    return rows;
  } catch {
    fallbackNotice();
    return EXPERIENCE.map((e, i) => ({ id: String(i), ...e }));
  }
});

export const getEducation = cache(async (): Promise<EducationView[]> => {
  try {
    const rows = await prisma.education.findMany({ orderBy: { order: "asc" } });
    if (!rows.length) throw new Error("empty");
    return rows;
  } catch {
    fallbackNotice();
    return EDUCATION.map((e, i) => ({ id: String(i), ...e }));
  }
});
