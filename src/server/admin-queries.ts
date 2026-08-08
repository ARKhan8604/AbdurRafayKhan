import "server-only";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

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

// Every getter below independently re-verifies the caller is the admin.
// The admin layout already gates the route tree, but these functions are
// exported and could be imported from anywhere in the future — never rely
// solely on "this is rendered inside a protected layout".

export async function adminGetSettings() {
  await requireAdmin();
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  } catch {
    return null;
  }
}

export async function adminGetSocials() {
  await requireAdmin();
  try {
    return await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminGetCategories() {
  await requireAdmin();
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

export async function adminGetProjects() {
  await requireAdmin();
  try {
    return await prisma.project.findMany({ orderBy: { order: "asc" }, include: projectInclude, take: 500 });
  } catch {
    return [];
  }
}

export async function adminGetProject(id: string) {
  await requireAdmin();
  if (typeof id !== "string" || !id || id.length > 64) return null;
  try {
    return await prisma.project.findUnique({ where: { id }, include: projectInclude });
  } catch {
    return null;
  }
}

export async function adminGetExperience() {
  await requireAdmin();
  try {
    return await prisma.experience.findMany({ orderBy: { order: "asc" }, take: 500 });
  } catch {
    return [];
  }
}

export async function adminGetEducation() {
  await requireAdmin();
  try {
    return await prisma.education.findMany({ orderBy: { order: "asc" }, take: 500 });
  } catch {
    return [];
  }
}

export async function adminGetSkills() {
  await requireAdmin();
  try {
    return await prisma.skill.findMany({ orderBy: { order: "asc" }, take: 1000 });
  } catch {
    return [];
  }
}

export async function adminCounts() {
  await requireAdmin();
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
