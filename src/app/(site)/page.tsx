import { Suspense } from "react";
import {
  getSettings,
  getSocials,
  getCategories,
  getFeaturedProjects,
  getSkills,
  getExperience,
  getEducation,
} from "@/server/queries";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Experience } from "@/components/sections/experience";
import { Education } from "@/components/sections/education";
import { GithubActivity } from "@/components/sections/github-activity";
import { Contact } from "@/components/sections/contact";
import { GithubSkeleton } from "@/components/sections/github-skeleton";
import { SITE } from "@/lib/constants";
import { safeJsonLd } from "@/lib/utils";

export const revalidate = 3600;

export default async function HomePage() {
  const [settings, socials, categories, featured, skills, experience, education] = await Promise.all([
    getSettings(),
    getSocials(),
    getCategories(),
    getFeaturedProjects(),
    getSkills(),
    getExperience(),
    getEducation(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.heroTitle,
    url: SITE.url,
    jobTitle: "Full-Stack Developer & AI Builder",
    email: settings.email ?? undefined,
    sameAs: socials.filter((s) => s.url.startsWith("http")).map((s) => s.url),
    description: settings.heroTagline ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <Hero settings={settings} socials={socials} categories={categories} />
      <About settings={settings} />
      <Skills skills={skills} />
      <FeaturedProjects projects={featured} categories={categories} />
      <Experience items={experience} />
      <Education items={education} />
      <Suspense fallback={<GithubSkeleton />}>
        <GithubActivity />
      </Suspense>
      <Contact settings={settings} socials={socials} />
    </>
  );
}
