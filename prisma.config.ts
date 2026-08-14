import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Neon serves two endpoints per database: a pooled one (PgBouncer, host suffixed
 * `-pooler`) and a direct one. The app runs through the pooled endpoint, but the
 * schema engine needs a direct session — PgBouncer's transaction pooling breaks
 * the advisory locks and temporary state migrations rely on.
 *
 * Set DIRECT_DATABASE_URL explicitly to override; otherwise the direct endpoint
 * is derived from DATABASE_URL by dropping the `-pooler` suffix, which is Neon's
 * documented naming convention.
 */
function directUrl(): string | undefined {
  const explicit = process.env.DIRECT_DATABASE_URL;
  if (explicit) return explicit;

  const pooled = process.env.DATABASE_URL;
  if (!pooled) return undefined;
  try {
    const url = new URL(pooled);
    url.hostname = url.hostname.replace("-pooler.", ".");
    return url.toString();
  } catch {
    return pooled;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directUrl(),
  },
});
