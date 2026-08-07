import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 config. Connection URLs live here (no longer in schema.prisma).
 * The Migrate CLI uses this datasource; the runtime client uses the pg
 * driver adapter (pooled DATABASE_URL) configured in src/lib/prisma.ts.
 *
 * Migrations use DIRECT_URL (non-pooled) — Neon's pooled endpoint doesn't
 * support the advisory locks/prepared statements Migrate relies on.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
