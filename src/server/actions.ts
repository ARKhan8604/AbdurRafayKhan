"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { ProjectStatus } from "@/types/content";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------ //
//  Site settings                                                      //
// ------------------------------------------------------------------ //
export interface SettingsInput {
  heroTitle?: string;
  heroSubtitle?: string;
  heroTagline?: string | null;
  roles?: string[];
  aboutHeading?: string | null;
  aboutBody?: string | null;
  location?: string | null;
  email?: string | null;
  availableForWork?: boolean;
  featuredRepos?: string[];
}

export async function updateSettings(input: SettingsInput) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: input,
    create: { id: "singleton", heroTitle: input.heroTitle ?? "Abdur Rafay Khan", ...input },
  });
  revalidatePublic();
}

export async function updateProfileImage(url: string | null) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { profileImageUrl: url },
    create: { id: "singleton", profileImageUrl: url },
  });
  revalidatePublic();
}

export async function updateResume(url: string | null) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { resumeUrl: url },
    create: { id: "singleton", resumeUrl: url },
  });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Social links                                                       //
// ------------------------------------------------------------------ //
export async function upsertSocial(input: { id?: string; platform: string; url: string; icon?: string | null }) {
  await requireAdmin();
  if (input.id) {
    await prisma.socialLink.update({
      where: { id: input.id },
      data: { platform: input.platform, url: input.url, icon: input.icon },
    });
  } else {
    const count = await prisma.socialLink.count();
    await prisma.socialLink.create({
      data: { platform: input.platform, url: input.url, icon: input.icon, order: count },
    });
  }
  revalidatePublic();
}

export async function deleteSocial(id: string) {
  await requireAdmin();
  await prisma.socialLink.delete({ where: { id } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Categories                                                         //
// ------------------------------------------------------------------ //
export async function upsertCategory(input: { id?: string; name: string; slug?: string }) {
  await requireAdmin();
  const slug = input.slug?.trim() || slugify(input.name);
  if (input.id) {
    await prisma.category.update({ where: { id: input.id }, data: { name: input.name, slug } });
  } else {
    const count = await prisma.category.count();
    await prisma.category.create({ data: { name: input.name, slug, order: count } });
  }
  revalidatePublic();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Projects                                                           //
// ------------------------------------------------------------------ //
export interface ProjectInput {
  title: string;
  slug?: string;
  description: string;
  longDescription?: string | null;
  overview?: string | null;
  problem?: string | null;
  solution?: string | null;
  challenges?: string | null;
  outcome?: string | null;
  role?: string | null;
  year?: string | null;
  technologies?: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  coverImageUrl?: string | null;
  status?: ProjectStatus;
  featured?: boolean;
  categoryIds?: string[];
}

export async function createProject(input: ProjectInput) {
  await requireAdmin();
  const count = await prisma.project.count();
  const slug = input.slug?.trim() || slugify(input.title);
  const project = await prisma.project.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      longDescription: input.longDescription,
      overview: input.overview,
      problem: input.problem,
      solution: input.solution,
      challenges: input.challenges,
      outcome: input.outcome,
      role: input.role,
      year: input.year,
      technologies: input.technologies ?? [],
      githubUrl: input.githubUrl,
      liveUrl: input.liveUrl,
      coverImageUrl: input.coverImageUrl,
      status: input.status ?? "COMPLETED",
      featured: input.featured ?? false,
      order: count,
      categories: input.categoryIds ? { connect: input.categoryIds.map((id) => ({ id })) } : undefined,
    },
  });
  revalidatePublic();
  return project.id;
}

export async function updateProject(id: string, input: ProjectInput) {
  await requireAdmin();
  const slug = input.slug?.trim() || slugify(input.title);
  await prisma.project.update({
    where: { id },
    data: {
      title: input.title,
      slug,
      description: input.description,
      longDescription: input.longDescription,
      overview: input.overview,
      problem: input.problem,
      solution: input.solution,
      challenges: input.challenges,
      outcome: input.outcome,
      role: input.role,
      year: input.year,
      technologies: input.technologies ?? [],
      githubUrl: input.githubUrl,
      liveUrl: input.liveUrl,
      coverImageUrl: input.coverImageUrl,
      status: input.status ?? "COMPLETED",
      featured: input.featured ?? false,
      categories: input.categoryIds ? { set: input.categoryIds.map((cid) => ({ id: cid })) } : undefined,
    },
  });
  revalidatePublic();
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { id } });
  revalidatePublic();
}

export async function toggleFeatured(id: string, featured: boolean) {
  await requireAdmin();
  await prisma.project.update({ where: { id }, data: { featured } });
  revalidatePublic();
}

export async function reorderProjects(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.project.update({ where: { id }, data: { order: i } }))
  );
  revalidatePublic();
}

// Project images
export async function addProjectImage(projectId: string, url: string, alt?: string) {
  await requireAdmin();
  const count = await prisma.projectImage.count({ where: { projectId } });
  await prisma.projectImage.create({ data: { projectId, url, alt, order: count } });
  revalidatePublic();
}

export async function deleteProjectImage(id: string) {
  await requireAdmin();
  await prisma.projectImage.delete({ where: { id } });
  revalidatePublic();
}

export async function reorderProjectImages(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, i) => prisma.projectImage.update({ where: { id }, data: { order: i } }))
  );
  revalidatePublic();
}

// Project team (replace-all)
export async function setProjectTeam(
  projectId: string,
  members: { name: string; role?: string | null; link?: string | null }[]
) {
  await requireAdmin();
  await prisma.teamMember.deleteMany({ where: { projectId } });
  if (members.length) {
    await prisma.teamMember.createMany({
      data: members.map((m, i) => ({ projectId, name: m.name, role: m.role, link: m.link, order: i })),
    });
  }
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Experience                                                         //
// ------------------------------------------------------------------ //
export interface ExperienceInput {
  id?: string;
  role: string;
  company: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string | null;
}

export async function upsertExperience(input: ExperienceInput) {
  await requireAdmin();
  const data = {
    role: input.role,
    company: input.company,
    location: input.location,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
    current: input.current ?? false,
    description: input.description,
  };
  if (input.id) {
    await prisma.experience.update({ where: { id: input.id }, data });
  } else {
    const count = await prisma.experience.count();
    await prisma.experience.create({ data: { ...data, order: count } });
  }
  revalidatePublic();
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  await prisma.experience.delete({ where: { id } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Education                                                          //
// ------------------------------------------------------------------ //
export interface EducationInput {
  id?: string;
  institution: string;
  degree: string;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  description?: string | null;
}

export async function upsertEducation(input: EducationInput) {
  await requireAdmin();
  const data = {
    institution: input.institution,
    degree: input.degree,
    field: input.field,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    current: input.current ?? false,
    description: input.description,
  };
  if (input.id) {
    await prisma.education.update({ where: { id: input.id }, data });
  } else {
    const count = await prisma.education.count();
    await prisma.education.create({ data: { ...data, order: count } });
  }
  revalidatePublic();
}

export async function deleteEducation(id: string) {
  await requireAdmin();
  await prisma.education.delete({ where: { id } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Skills                                                             //
// ------------------------------------------------------------------ //
export interface SkillInput {
  id?: string;
  name: string;
  group: string;
  level?: number | null;
}

export async function upsertSkill(input: SkillInput) {
  await requireAdmin();
  if (input.id) {
    await prisma.skill.update({
      where: { id: input.id },
      data: { name: input.name, group: input.group, level: input.level },
    });
  } else {
    const count = await prisma.skill.count();
    await prisma.skill.create({ data: { name: input.name, group: input.group, level: input.level, order: count } });
  }
  revalidatePublic();
}

export async function deleteSkill(id: string) {
  await requireAdmin();
  await prisma.skill.delete({ where: { id } });
  revalidatePublic();
}
