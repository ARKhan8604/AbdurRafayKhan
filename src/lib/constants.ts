/** Site-wide constants and navigation config. */

export const SITE = {
  name: "Abdur Rafay Khan",
  shortName: "ARKhan",
  role: "Computer Science Student • Full-Stack Developer • AI Builder",
  githubUser: "ARKhan8604",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://abdurrafaykhan.dev",
} as const;

export type NavSection = {
  id: string;
  label: string;
};

/** In-page anchor sections, in order, used by nav + command palette + scrollspy. */
export const SECTIONS: NavSection[] = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
];

/** Motion timing tokens shared across components (seconds). */
export const MOTION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.6,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: { type: "spring", stiffness: 320, damping: 30, mass: 0.8 } as const,
};
