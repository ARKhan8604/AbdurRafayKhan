/** Application-level view types the UI consumes (decoupled from Prisma models). */

export type ProjectStatus = "LIVE" | "IN_PROGRESS" | "COMPLETED" | "CONCEPT" | "ARCHIVED";

export interface CategoryView {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface TeamMemberView {
  name: string;
  role?: string | null;
  link?: string | null;
}

export interface ProjectImageView {
  url: string;
  alt?: string | null;
}

export interface ProjectView {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription?: string | null;
  overview?: string | null;
  problem?: string | null;
  solution?: string | null;
  challenges?: string | null;
  outcome?: string | null;
  role?: string | null;
  year?: string | null;
  technologies: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
  coverImageUrl?: string | null;
  status: ProjectStatus;
  featured: boolean;
  order: number;
  categories: CategoryView[];
  images: ProjectImageView[];
  team: TeamMemberView[];
}

export interface SettingsView {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline?: string | null;
  roles: string[];
  aboutHeading?: string | null;
  aboutBody?: string | null;
  profileImageUrl?: string | null;
  resumeUrl?: string | null;
  location?: string | null;
  email?: string | null;
  availableForWork: boolean;
  featuredRepos: string[];
}

export interface SkillView {
  id: string;
  name: string;
  group: string;
  level?: number | null;
  order: number;
}

export interface ExperienceView {
  id: string;
  role: string;
  company: string;
  location?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  current: boolean;
  description?: string | null;
  order: number;
}

export interface EducationView {
  id: string;
  institution: string;
  degree: string;
  field?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  current: boolean;
  description?: string | null;
  order: number;
}

export interface SocialView {
  id: string;
  platform: string;
  url: string;
  icon?: string | null;
  order: number;
}
