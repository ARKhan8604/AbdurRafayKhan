import "server-only";
import { prisma } from "@/lib/prisma";

/** True when the database is reachable — used to show a setup banner in admin. */
export async function getDbStatus(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const projectInclude = {
  categories: true,
  images: { orderBy: { order: "asc" as const } },
  team: { orderBy: { order: "asc" as const } },
};

export async function adminGetSettings() {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    return null;
  }
}

export async function adminGetSocials() {
  try {
    return await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminGetCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminGetProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { order: "asc" }, include: projectInclude });
  } catch {
    return [];
  }
}

export async function adminGetProject(id: string) {
  try {
    return await prisma.project.findUnique({ where: { id }, include: projectInclude });
  } catch {
    return null;
  }
}

export async function adminGetExperience() {
  try {
    return await prisma.experience.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminGetEducation() {
  try {
    return await prisma.education.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminGetSkills() {
  try {
    return await prisma.skill.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminCounts() {
  try {
    const [projects, skills, experience, education, categories, socials] = await Promise.all([
      prisma.project.count(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.education.count(),
      prisma.category.count(),
      prisma.socialLink.count(),
    ]);
    return { projects, skills, experience, education, categories, socials };
  } catch {
    return { projects: 0, skills: 0, experience: 0, education: 0, categories: 0, socials: 0 };
  }
}
