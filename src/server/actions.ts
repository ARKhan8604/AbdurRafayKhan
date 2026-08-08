"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify, normalizeUrl } from "@/lib/utils";
import { requireAdmin } from "@/lib/require-admin";
import { enforceRateLimit, getClientIp } from "@/lib/rate-limit";

// ------------------------------------------------------------------ //
//  Shared guards                                                      //
// ------------------------------------------------------------------ //

/**
 * Every mutation calls this first. Order matters: rate-limit by IP before
 * doing any auth/DB work (so a flood is cheap to reject even when
 * unauthenticated), then verify the caller is genuinely the admin. Both
 * checks are independent of whatever the calling UI already did.
 */
async function guardMutation() {
  const ip = await getClientIp();
  await enforceRateLimit("adminMutation", ip);
  return requireAdmin();
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

/** A URL field that, once normalized, must be a genuinely valid http(s)/mailto URL — or empty. */
const urlField = z
  .string()
  .trim()
  .max(2048)
  .optional()
  .nullable()
  .transform((v) => normalizeUrl(v) ?? null)
  .refine(
    (v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return ["http:", "https:", "mailto:"].includes(u.protocol);
      } catch {
        return false;
      }
    },
    { message: "Must be a valid http(s) or mailto URL" }
  );

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const cuid = z.string().trim().min(1).max(64);

// ------------------------------------------------------------------ //
//  Site settings                                                      //
// ------------------------------------------------------------------ //
const settingsSchema = z.object({
  heroTitle: shortText(120).optional(),
  heroSubtitle: shortText(200).optional(),
  heroTagline: optionalText(300),
  roles: z.array(shortText(60)).max(20).optional(),
  aboutHeading: optionalText(200),
  aboutBody: optionalText(4000),
  location: optionalText(120),
  email: z.string().trim().email().max(200).optional().nullable(),
  availableForWork: z.boolean().optional(),
  featuredRepos: z.array(shortText(200)).max(50).optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export async function updateSettings(input: SettingsInput) {
  await guardMutation();
  const data = settingsSchema.parse(input);
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", heroTitle: data.heroTitle ?? "Abdur Rafay Khan", ...data },
  });
  revalidatePublic();
}

const imageUrlSchema = z.string().trim().max(2048).nullable();

export async function updateProfileImage(url: string | null) {
  await guardMutation();
  const value = imageUrlSchema.parse(url);
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { profileImageUrl: value },
    create: { id: "singleton", profileImageUrl: value },
  });
  revalidatePublic();
}

export async function updateResume(url: string | null) {
  await guardMutation();
  const value = imageUrlSchema.parse(url);
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { resumeUrl: value },
    create: { id: "singleton", resumeUrl: value },
  });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Social links                                                       //
// ------------------------------------------------------------------ //
const socialSchema = z.object({
  id: cuid.optional(),
  platform: shortText(60),
  url: z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .transform((v) => normalizeUrl(v)!)
    .refine(
      (v) => {
        try {
          return ["http:", "https:", "mailto:"].includes(new URL(v).protocol);
        } catch {
          return false;
        }
      },
      { message: "Must be a valid http(s) or mailto URL" }
    ),
  icon: optionalText(40),
});

export async function upsertSocial(input: z.infer<typeof socialSchema>) {
  await guardMutation();
  const { id, platform, url, icon } = socialSchema.parse(input);
  if (id) {
    await prisma.socialLink.update({ where: { id }, data: { platform, url, icon } });
  } else {
    const count = await prisma.socialLink.count();
    await prisma.socialLink.create({ data: { platform, url, icon, order: count } });
  }
  revalidatePublic();
}

export async function deleteSocial(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.socialLink.delete({ where: { id: parsedId } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Categories                                                         //
// ------------------------------------------------------------------ //
const categorySchema = z.object({
  id: cuid.optional(),
  name: shortText(60),
  slug: optionalText(60),
});

export async function upsertCategory(input: z.infer<typeof categorySchema>) {
  await guardMutation();
  const { id, name, slug: slugInput } = categorySchema.parse(input);
  const slug = slugInput?.trim() || slugify(name);
  if (id) {
    await prisma.category.update({ where: { id }, data: { name, slug } });
  } else {
    const count = await prisma.category.count();
    await prisma.category.create({ data: { name, slug, order: count } });
  }
  revalidatePublic();
}

export async function deleteCategory(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.category.delete({ where: { id: parsedId } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Projects                                                           //
// ------------------------------------------------------------------ //
const PROJECT_STATUSES = ["LIVE", "IN_PROGRESS", "COMPLETED", "CONCEPT", "ARCHIVED"] as const;

const projectSchema = z.object({
  title: shortText(200),
  slug: optionalText(200),
  description: shortText(500),
  longDescription: optionalText(5000),
  overview: optionalText(5000),
  problem: optionalText(5000),
  solution: optionalText(5000),
  challenges: optionalText(5000),
  outcome: optionalText(5000),
  role: optionalText(120),
  year: optionalText(20),
  technologies: z.array(shortText(60)).max(50).optional(),
  githubUrl: urlField,
  liveUrl: urlField,
  coverImageUrl: optionalText(2048),
  status: z.enum(PROJECT_STATUSES).optional(),
  featured: z.boolean().optional(),
  categoryIds: z.array(cuid).max(50).optional(),
});
export type ProjectInput = z.input<typeof projectSchema>;

export async function createProject(input: ProjectInput) {
  await guardMutation();
  const data = projectSchema.parse(input);
  const count = await prisma.project.count();
  const slug = data.slug?.trim() || slugify(data.title);
  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      longDescription: data.longDescription,
      overview: data.overview,
      problem: data.problem,
      solution: data.solution,
      challenges: data.challenges,
      outcome: data.outcome,
      role: data.role,
      year: data.year,
      technologies: data.technologies ?? [],
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      coverImageUrl: data.coverImageUrl,
      status: data.status ?? "COMPLETED",
      featured: data.featured ?? false,
      order: count,
      categories: data.categoryIds ? { connect: data.categoryIds.map((id) => ({ id })) } : undefined,
    },
  });
  revalidatePublic();
  return project.id;
}

export async function updateProject(id: string, input: ProjectInput) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  const data = projectSchema.parse(input);
  const slug = data.slug?.trim() || slugify(data.title);
  await prisma.project.update({
    where: { id: parsedId },
    data: {
      title: data.title,
      slug,
      description: data.description,
      longDescription: data.longDescription,
      overview: data.overview,
      problem: data.problem,
      solution: data.solution,
      challenges: data.challenges,
      outcome: data.outcome,
      role: data.role,
      year: data.year,
      technologies: data.technologies ?? [],
      githubUrl: data.githubUrl,
      liveUrl: data.liveUrl,
      coverImageUrl: data.coverImageUrl,
      status: data.status ?? "COMPLETED",
      featured: data.featured ?? false,
      categories: data.categoryIds ? { set: data.categoryIds.map((cid) => ({ id: cid })) } : undefined,
    },
  });
  revalidatePublic();
}

export async function deleteProject(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.project.delete({ where: { id: parsedId } });
  revalidatePublic();
}

export async function toggleFeatured(id: string, featured: boolean) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  const parsedFeatured = z.boolean().parse(featured);
  await prisma.project.update({ where: { id: parsedId }, data: { featured: parsedFeatured } });
  revalidatePublic();
}

export async function reorderProjects(orderedIds: string[]) {
  await guardMutation();
  const ids = z.array(cuid).max(500).parse(orderedIds);
  await prisma.$transaction(ids.map((id, i) => prisma.project.update({ where: { id }, data: { order: i } })));
  revalidatePublic();
}

// Project images
const addImageSchema = z.object({
  projectId: cuid,
  url: z.string().trim().min(1).max(2048),
  alt: optionalText(300),
});

export async function addProjectImage(projectId: string, url: string, alt?: string) {
  await guardMutation();
  const data = addImageSchema.parse({ projectId, url, alt });
  const count = await prisma.projectImage.count({ where: { projectId: data.projectId } });
  await prisma.projectImage.create({
    data: { projectId: data.projectId, url: data.url, alt: data.alt, order: count },
  });
  revalidatePublic();
}

export async function deleteProjectImage(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.projectImage.delete({ where: { id: parsedId } });
  revalidatePublic();
}

export async function reorderProjectImages(orderedIds: string[]) {
  await guardMutation();
  const ids = z.array(cuid).max(200).parse(orderedIds);
  await prisma.$transaction(
    ids.map((id, i) => prisma.projectImage.update({ where: { id }, data: { order: i } }))
  );
  revalidatePublic();
}

// Project team (replace-all)
const teamMemberSchema = z.object({
  name: shortText(120),
  role: optionalText(120),
  link: urlField,
});
const teamSchema = z.array(teamMemberSchema).max(50);

export async function setProjectTeam(projectId: string, members: z.input<typeof teamSchema>) {
  await guardMutation();
  const parsedProjectId = cuid.parse(projectId);
  const parsedMembers = teamSchema.parse(members);
  await prisma.teamMember.deleteMany({ where: { projectId: parsedProjectId } });
  if (parsedMembers.length) {
    await prisma.teamMember.createMany({
      data: parsedMembers.map((m, i) => ({
        projectId: parsedProjectId,
        name: m.name,
        role: m.role,
        link: m.link,
        order: i,
      })),
    });
  }
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Experience                                                         //
// ------------------------------------------------------------------ //
const dateString = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), { message: "Invalid date" });

const experienceSchema = z.object({
  id: cuid.optional(),
  role: shortText(120),
  company: shortText(120),
  location: optionalText(120),
  startDate: dateString,
  endDate: dateString.optional().nullable(),
  current: z.boolean().optional(),
  description: optionalText(2000),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;

export async function upsertExperience(input: ExperienceInput) {
  await guardMutation();
  const parsed = experienceSchema.parse(input);
  const data = {
    role: parsed.role,
    company: parsed.company,
    location: parsed.location,
    startDate: new Date(parsed.startDate),
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    current: parsed.current ?? false,
    description: parsed.description,
  };
  if (parsed.id) {
    await prisma.experience.update({ where: { id: parsed.id }, data });
  } else {
    const count = await prisma.experience.count();
    await prisma.experience.create({ data: { ...data, order: count } });
  }
  revalidatePublic();
}

export async function deleteExperience(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.experience.delete({ where: { id: parsedId } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Education                                                          //
// ------------------------------------------------------------------ //
const educationSchema = z.object({
  id: cuid.optional(),
  institution: shortText(200),
  degree: shortText(200),
  field: optionalText(120),
  startDate: dateString.optional().nullable(),
  endDate: dateString.optional().nullable(),
  current: z.boolean().optional(),
  description: optionalText(2000),
});
export type EducationInput = z.infer<typeof educationSchema>;

export async function upsertEducation(input: EducationInput) {
  await guardMutation();
  const parsed = educationSchema.parse(input);
  const data = {
    institution: parsed.institution,
    degree: parsed.degree,
    field: parsed.field,
    startDate: parsed.startDate ? new Date(parsed.startDate) : null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    current: parsed.current ?? false,
    description: parsed.description,
  };
  if (parsed.id) {
    await prisma.education.update({ where: { id: parsed.id }, data });
  } else {
    const count = await prisma.education.count();
    await prisma.education.create({ data: { ...data, order: count } });
  }
  revalidatePublic();
}

export async function deleteEducation(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.education.delete({ where: { id: parsedId } });
  revalidatePublic();
}

// ------------------------------------------------------------------ //
//  Skills                                                             //
// ------------------------------------------------------------------ //
const skillSchema = z.object({
  id: cuid.optional(),
  name: shortText(80),
  group: shortText(80),
  level: z.number().int().min(0).max(100).optional().nullable(),
});
export type SkillInput = z.infer<typeof skillSchema>;

export async function upsertSkill(input: SkillInput) {
  await guardMutation();
  const { id, name, group, level } = skillSchema.parse(input);
  if (id) {
    await prisma.skill.update({ where: { id }, data: { name, group, level } });
  } else {
    const count = await prisma.skill.count();
    await prisma.skill.create({ data: { name, group, level, order: count } });
  }
  revalidatePublic();
}

export async function deleteSkill(id: string) {
  await guardMutation();
  const parsedId = cuid.parse(id);
  await prisma.skill.delete({ where: { id: parsedId } });
  revalidatePublic();
}
