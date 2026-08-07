import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 config. Connection URLs live here (no longer in schema.prisma).
 * The Migrate CLI uses this datasource; the runtime client uses the pg
 * driver adapter (pooled DATABASE_URL) configured in src/lib/prisma.ts.
 *
 * Migrations use DIRECT_URL (non-pooled) — Neon's pooled endpoint doesn't
 * support the advisory locks/prepared statements Migrate relies on.
 *
 * Read via plain process.env (not the `env()` helper) so `prisma generate`
 * — which needs no live connection — doesn't hard-fail on hosts like Vercel
 * where DIRECT_URL may not be exposed at install time.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder",
  },
});
