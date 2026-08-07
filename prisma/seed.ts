import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  SETTINGS,
  SOCIALS,
  CATEGORIES,
  PROJECTS,
  SKILLS,
  EXPERIENCE,
  EDUCATION,
} from "../src/lib/content";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("→ Seeding site settings…");
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", ...SETTINGS },
  });

  console.log("→ Seeding social links…");
  await prisma.socialLink.deleteMany();
  await prisma.socialLink.createMany({ data: SOCIALS });

  console.log("→ Seeding categories…");
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, order: c.order },
      create: c,
    });
  }
  const categoryBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  console.log("→ Seeding projects…");
  for (const p of PROJECTS) {
    const categoryIds = p.categorySlugs.map((s) => ({ id: categoryBySlug[s] }));
    const data = {
      title: p.title,
      description: p.description,
      longDescription: p.longDescription,
      overview: p.overview,
      problem: p.problem,
      solution: p.solution,
      challenges: p.challenges,
      outcome: p.outcome,
      role: p.role,
      year: p.year,
      technologies: p.technologies,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl,
      status: p.status,
      featured: p.featured,
      order: p.order,
    };
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...data, categories: { set: categoryIds } },
      create: { slug: p.slug, ...data, categories: { connect: categoryIds } },
    });

    await prisma.teamMember.deleteMany({ where: { projectId: project.id } });
    if (p.team?.length) {
      await prisma.teamMember.createMany({
        data: p.team.map((t, i) => ({
          projectId: project.id,
          name: t.name,
          role: t.role,
          link: t.link,
          order: i,
        })),
      });
    }
  }

  console.log("→ Seeding skills…");
  await prisma.skill.deleteMany();
  await prisma.skill.createMany({ data: SKILLS.map((s, i) => ({ ...s, order: i })) });

  console.log("→ Seeding experience…");
  await prisma.experience.deleteMany();
  await prisma.experience.createMany({
    data: EXPERIENCE.map((e) => ({
      ...e,
      startDate: new Date(e.startDate),
      endDate: e.endDate ? new Date(e.endDate) : null,
    })),
  });

  console.log("→ Seeding education…");
  await prisma.education.deleteMany();
  await prisma.education.createMany({
    data: EDUCATION.map((e) => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate) : null,
      endDate: e.endDate ? new Date(e.endDate) : null,
    })),
  });

  console.log("✔ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
