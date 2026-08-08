import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 runtime client using the node-postgres driver adapter.
 * A single pooled client is reused across hot-reloads in development.
 *
 * Construction must never throw: `pg` connects lazily on first query, so
 * building the client with a missing/placeholder connection string is safe.
 * This lets consumers (see src/server/queries.ts) catch the resulting query
 * error and fall back to static content — including during Vercel's build
 * step, which imports route modules before DATABASE_URL may be configured.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  // Small pool per serverless instance: each invocation mostly needs one
  // connection at a time, and Neon's pooled (pgbouncer) endpoint already
  // multiplexes across instances. A large per-instance pool just risks
  // exhausting Neon's connection limit under a traffic spike.
  const adapter = new PrismaPg({ connectionString, max: 5 });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
