# Abdur Rafay Khan — Portfolio

A premium, database-driven personal portfolio built as a product, not a template. Full-screen animated hero, per-project case studies, a ⌘K command palette, dual light/dark themes, live GitHub activity, and a complete `/admin` CMS so every word and image on the public site is editable without touching code.

## Tech Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** with semantic design tokens + dual theme (`next-themes`)
- **Motion** (Framer Motion successor) for reveals, page transitions, micro-interactions
- **Prisma 7** + **Neon PostgreSQL** (pg driver adapter)
- **Auth.js v5** — GitHub OAuth restricted to a single account
- **Cloudinary** — signed direct uploads (only URLs stored in the DB)
- **cmdk** command palette · **Vercel Analytics** + **PostHog** product analytics
- Custom **Canvas 2D particle-network** hero background (no heavy 3D dependency)

## Features

- **Animated hero** with an interactive particle constellation that reacts to mouse + scroll, an "Explore My Work" category dropdown, social rail, and scroll indicator.
- **Sections**: About, Skills (terminal-style), Featured Projects (filterable bento grid), Experience & Education timelines, live GitHub activity, and Contact.
- **Case-study pages** (`/projects/[slug]`) with Overview · Problem · Solution · Challenges · Outcome · Gallery (lightbox) · Team · prev/next, per-project dynamic OG images, and JSON-LD.
- **⌘K command palette** to jump to any section, project, or action.
- **Admin CMS** at `/admin`: edit hero/about, upload profile photo + résumé, manage social links, full project CRUD with drag-reorder + featured toggle + gallery + team + case-study fields, and CRUD for categories, experience, education, and skills. Saves revalidate the public site instantly.
- **Graceful fallback**: the whole site renders from `src/lib/content.ts` before a database is connected, then switches to live data automatically.
- 95+ Lighthouse target: semantic HTML, keyboard nav, visible focus, `prefers-reduced-motion` support, `next/image`, ISR caching, dynamic OG images, sitemap, robots, and manifest.

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

- **Neon** — create a free Postgres project at [neon.tech](https://neon.tech) and paste the connection string into `DATABASE_URL`.
- **GitHub OAuth** — create an OAuth app (GitHub → Settings → Developer settings → OAuth Apps):
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback/github`
  - Put the client id/secret into `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.
  - Set `ADMIN_GITHUB_LOGIN` to your GitHub username (only this account can access `/admin`).
  - Generate `AUTH_SECRET` with `npx auth secret`.
- **Cloudinary** — from your dashboard, set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **PostHog / GitHub token** — optional; enable analytics and the contribution calendar.

### 3. Set up the database

```bash
npm run db:push     # create tables from the Prisma schema
npm run db:seed     # seed real project content, skills, experience, education
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in to the CMS at [/login](http://localhost:3000/login) with your GitHub account.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:push` | Push the schema to the database |
| `npm run db:seed` | Seed initial content |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | Create/apply a migration |

## Project Structure

```
prisma/            schema.prisma, seed.ts
src/
  app/
    (site)/        public site (home, projects, case studies)
    admin/         protected CMS
    login/         admin sign-in
    api/           auth + cloudinary signing
  components/      ui, sections, hero, projects, command, admin, motion, theme
  server/          queries (public, cached) + actions + admin queries
  lib/             prisma, auth config, cloudinary, github, content, analytics
  types/           view types
```

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add all environment variables from `.env` (use your Neon **pooled** connection string).
3. Update the GitHub OAuth app callback URL to `https://your-domain/api/auth/callback/github`, and set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Deploy. Run `npm run db:push && npm run db:seed` once against the production database (locally with the prod `DATABASE_URL`, or via a one-off job).

## Editing content

Everything on the public site is managed from `/admin`. The initial seed content lives in `src/lib/content.ts` — it doubles as the offline fallback and the database seed.
