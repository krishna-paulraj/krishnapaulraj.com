import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 runs on the query compiler, so the client is driven by a driver
 * adapter rather than a connection string in the schema. The app connects
 * through Neon's pooled endpoint; the schema engine uses the direct one (see
 * prisma.config.ts).
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

let client: PrismaClient | null = null;

/**
 * Lazy singleton, matching lib/redis.ts: importing this module never throws, so
 * a missing DATABASE_URL surfaces at the call site where the route can degrade
 * gracefully instead of taking down everything that transitively imports it.
 *
 * In development the instance is parked on globalThis so Next's hot reload
 * doesn't leak a new connection pool on every edit.
 */
export function getPrisma(): PrismaClient {
  if (client) return client;
  if (globalThis.__prisma) {
    client = globalThis.__prisma;
    return client;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = client;
  }
  return client;
}
