/**
 * Single source of truth for initial portfolio content.
 * Used by prisma/seed.ts (to populate the DB) AND by the query layer as a
 * graceful fallback so the site renders fully even before a database is connected.
 */
import type { ProjectStatus } from "../types/content";

export interface SeedProject {
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  overview?: string;
  problem?: string;
  solution?: string;
  challenges?: string;
  outcome?: string;
  role?: string;
  year?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  featured: boolean;
  order: number;
  categorySlugs: string[];
  team?: { name: string; role?: string; link?: string }[];
}

export const SETTINGS = {
  heroTitle: "Abdur Rafay Khan",
  heroSubtitle: "Computer Science Student • Full-Stack Developer • AI Builder",
  heroTagline:
    "I build fast, thoughtful web products — from AI-powered apps to polished business sites.",
  roles: ["Computer Science Student", "Full-Stack Developer", "AI Builder"],
  aboutHeading: "Building software that feels considered.",
  aboutBody:
    "I'm a computer science student and full-stack developer who cares about the details — the ones people feel but rarely notice. I work end to end: designing interfaces, building the systems behind them, and shipping products that are fast, accessible, and genuinely useful.\n\nLately I've been drawn to the intersection of AI and the web — building things like QuickSign, a browser-based ASL learning app — while also crafting refined marketing and product sites for real clients. Whatever the project, my goal is the same: make it feel effortless.",
  location: "Available worldwide · Remote",
  email: "abdurrafay.khan04@gmail.com",
  availableForWork: true,
  featuredRepos: ["reservation-system", "TijaaratInteriors"],
};

export const SOCIALS = [
  { platform: "GitHub", url: "https://github.com/ARKhan8604", icon: "github", order: 0 },
  { platform: "LinkedIn", url: "https://www.linkedin.com/", icon: "linkedin", order: 1 },
  { platform: "Email", url: "mailto:abdurrafay.khan04@gmail.com", icon: "mail", order: 2 },
];

export const CATEGORIES = [
  { name: "AI", slug: "ai", order: 0 },
  { name: "Full Stack", slug: "full-stack", order: 1 },
  { name: "Business Websites", slug: "business-websites", order: 2 },
  { name: "UI/UX", slug: "ui-ux", order: 3 },
  { name: "University Projects", slug: "university-projects", order: 4 },
  { name: "Open Source", slug: "open-source", order: 5 },
];

export const PROJECTS: SeedProject[] = [
  {
    slug: "quicksign",
    title: "QuickSign — Learn ASL with Zippy",
    description:
      "A gamified web app that teaches American Sign Language through real-time, in-browser hand-gesture recognition.",
    longDescription:
      "QuickSign turns learning American Sign Language into a game. Guided by a friendly companion named Zippy, learners practice signs with their webcam while the app recognizes hand gestures in real time and gives instant feedback — no downloads, no special hardware.",
    overview:
      "QuickSign is an interactive ASL learning platform built around immediate, playful feedback. Instead of passively watching videos, users sign in front of their camera and the app confirms whether they formed the sign correctly, keeping a streak and progression that make practice feel like play.",
    problem:
      "Most ASL learning tools are passive — videos and flashcards that never tell you whether you are actually signing correctly. Beginners get no feedback loop, so bad habits form early and motivation fades.",
    solution:
      "We built a browser-based recognizer that reads hand landmarks from the webcam and validates each sign live, wrapped in a gamified flow (a mascot, streaks, and levels) that rewards consistent practice and keeps sessions short and fun.",
    challenges:
      "Running gesture recognition smoothly in the browser meant carefully managing the camera pipeline and inference performance across devices, and designing forgiving detection thresholds so learners feel encouraged rather than penalized.",
    outcome:
      "A shipped, publicly playable product that makes a genuinely hard skill approachable — and a strong proof-of-concept for on-device ML in an education setting.",
    role: "Co-founder & Developer",
    year: "2024",
    technologies: ["Next.js", "TypeScript", "TensorFlow.js", "MediaPipe Hands", "Tailwind CSS", "Vercel"],
    liveUrl: "https://aslgame.vercel.app/",
    status: "LIVE",
    featured: true,
    order: 0,
    categorySlugs: ["ai"],
    team: [{ name: "Muhammad Saad", role: "Co-founder" }],
  },
  {
    slug: "appna-nj",
    title: "APPNA New Jersey",
    description:
      "The official website for a nonprofit uniting Pakistani-American physicians serving New Jersey communities.",
    longDescription:
      "APPNA New Jersey is a 501(c)(3) that unites Pakistani-American physicians around free medical clinics, student mentorship, and community relief. The site presents the organization's programs, impact, leadership, and events, and drives membership and donations.",
    overview:
      "A content-rich, trustworthy web presence for a healthcare nonprofit — communicating mission and impact (10,000+ patients served, 200+ students mentored), surfacing programs and events, and converting visitors into members, donors, and volunteers.",
    problem:
      "A growing nonprofit needed a credible, modern home that could clearly tell its story, showcase measurable impact, and make it effortless to join, donate, or volunteer.",
    solution:
      "A clean, image-led marketing site with statistics, program cards, leadership, and events — built for fast loads and easy content updates, with social integration and clear calls to action throughout.",
    outcome:
      "A professional public face that reflects the organization's stature and streamlines community engagement.",
    role: "Full-Stack Developer",
    year: "2024",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
    liveUrl: "https://www.appnanj.org/",
    status: "LIVE",
    featured: true,
    order: 1,
    categorySlugs: ["business-websites", "full-stack"],
  },
  {
    slug: "tijaarat-interiors",
    title: "Tijaarat Interiors",
    description:
      "A premium catalog site for a bespoke furniture and woodworks manufacturer with 25+ years of craft.",
    longDescription:
      "Tijaarat Interiors is a family-owned workshop crafting custom furniture for homes and commercial spaces. The site showcases their catalog by room, tells the workshop's heritage story, and connects clients directly via contact and WhatsApp for personalized consultations.",
    overview:
      "An upscale, minimal storefront that lets a craftsmanship-led brand present its work beautifully — organized by room, rich with imagery, and optimized so heavy product photography still loads fast.",
    problem:
      "A high-end furniture maker needed a digital showroom that matched the quality of their handcrafted work and turned browsers into consultation leads.",
    solution:
      "A whitespace-forward, editorial design with room-based catalogs, an 'our workshop' narrative, optimized Cloudinary imagery, and frictionless WhatsApp/contact entry points.",
    challenges:
      "Balancing large, high-fidelity product imagery against performance — solved with responsive, dynamically optimized images and disciplined layout.",
    outcome: "A polished brand experience that positions the workshop as a premium, contemporary choice.",
    role: "Full-Stack Developer & Designer",
    year: "2024",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Cloudinary", "Vercel"],
    liveUrl: "https://tijaarat-interiors.vercel.app/",
    githubUrl: "https://github.com/ARKhan8604/TijaaratInteriors",
    status: "LIVE",
    featured: true,
    order: 2,
    categorySlugs: ["business-websites", "full-stack", "ui-ux"],
  },
  {
    slug: "restaurant-reservation-system",
    title: "Restaurant Reservation System",
    description:
      "A multi-tenant table-booking platform where diners pick a date, party size, and available time per venue.",
    longDescription:
      "A reservation system that lets restaurants accept online bookings through a clean, guided flow. Each venue has its own booking page; diners choose a date, specify party size, and search real-time availability before confirming a table.",
    overview:
      "An end-to-end booking product — per-venue routes, a calendar-driven flow, party-size constraints, and availability search — designed to be embeddable for multiple restaurants.",
    problem:
      "Small restaurants need a simple way to take reservations online without expensive third-party platforms or clunky phone-only booking.",
    solution:
      "A multi-tenant Next.js app with per-venue booking pages, a date/party-size/availability flow, and a persistent data layer to manage reservations and prevent double-booking.",
    challenges:
      "Modeling availability and per-venue configuration cleanly, and keeping the booking flow fast and unambiguous on mobile.",
    outcome: "A reusable reservation engine that any venue can be onboarded onto via its own route.",
    role: "Full-Stack Developer",
    year: "2025",
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS", "Vercel"],
    liveUrl: "https://reservation-system-7nyw.vercel.app/book/demo-diner/main",
    githubUrl: "https://github.com/ARKhan8604/reservation-system",
    status: "LIVE",
    featured: true,
    order: 3,
    categorySlugs: ["full-stack"],
  },
  {
    slug: "industrial-power-optimizer",
    title: "Industrial Power Optimizer",
    description:
      "UI/UX design for a tool that helps industrial facilities monitor and optimize their power consumption.",
    longDescription:
      "Industrial Power Optimizer is a project focused on improving energy efficiency in industrial settings. I led the UI/UX design — shaping the interface, information architecture, and user flows. Screenshots, technical details, and links will be added here.",
    overview:
      "A concept-to-interface effort where I owned the product's UI/UX: translating a data-heavy, technical domain into a clear, usable interface for operators.",
    role: "UI/UX Designer",
    year: "2025",
    technologies: ["Figma", "UI/UX Design", "Prototyping"],
    status: "IN_PROGRESS",
    featured: false,
    order: 4,
    categorySlugs: ["ui-ux", "university-projects"],
    team: [{ name: "Ahmed Nazir", role: "Project Partner" }],
  },
];

export const SKILLS: { name: string; group: string }[] = [
  ...["TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3"].map((name) => ({
    name,
    group: "Languages",
  })),
  ...["React", "Next.js", "Node.js", "Express", "Tailwind CSS", "Prisma", "Framer Motion"].map(
    (name) => ({ name, group: "Frameworks & Libraries" })
  ),
  ...["TensorFlow.js", "MediaPipe", "OpenAI API"].map((name) => ({ name, group: "AI / ML" })),
  ...["Git", "GitHub", "Vercel", "Cloudinary", "PostgreSQL", "Figma", "Docker"].map((name) => ({
    name,
    group: "Tools & Platforms",
  })),
];

export const EXPERIENCE = [
  {
    role: "Co-founder & Developer",
    company: "QuickSign",
    location: "Remote",
    startDate: "2024-01-01",
    endDate: null as string | null,
    current: true,
    description:
      "Co-founded and built QuickSign, a gamified ASL learning app using in-browser hand-gesture recognition. Owned the full-stack build and product direction.",
    order: 0,
  },
  {
    role: "Full-Stack Developer (Freelance)",
    company: "Independent",
    location: "Remote",
    startDate: "2023-06-01",
    endDate: null as string | null,
    current: true,
    description:
      "Design and build production web apps for clients and organizations — including APPNA New Jersey and Tijaarat Interiors — with Next.js, TypeScript, and Tailwind CSS.",
    order: 1,
  },
];

export const EDUCATION = [
  {
    institution: "Add your university in the admin panel",
    degree: "BSc Computer Science",
    field: "Computer Science",
    startDate: "2022-09-01" as string | null,
    endDate: null as string | null,
    current: true,
    description:
      "Studying core computer science — algorithms, data structures, systems, and software engineering — alongside hands-on full-stack and AI project work.",
    order: 0,
  },
];
