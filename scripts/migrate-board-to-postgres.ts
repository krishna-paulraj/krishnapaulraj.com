/**
 * One-time backfill: copy the board out of its old Redis key and into Postgres.
 *
 * The board used to live as a single JSON blob under the Redis key "board".
 * Storage of record is now Postgres, so run this once with the production
 * environment loaded:
 *
 *   pnpm db:migrate-from-redis          # dry run, prints what it would write
 *   pnpm db:migrate-from-redis --write  # actually writes
 *
 * It is idempotent: cards are upserted by id, so re-running only refreshes
 * fields. It never deletes, so a partially migrated board can be topped up.
 */
// dotenv no-ops when .env is absent, so shell-exported env also works.
import "dotenv/config";
import { Redis } from "@upstash/redis";

import { BOARD_COLUMNS, parseBoardState } from "../lib/board";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const REDIS_BOARD_KEY = "board";

async function main() {
  const write = process.argv.includes("--write");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — " +
        "run this with the environment that holds the old board.",
    );
  }

  const stored = await Redis.fromEnv().get<unknown>(REDIS_BOARD_KEY);
  if (stored === null || stored === undefined) {
    console.log(`Nothing stored under the Redis key "${REDIS_BOARD_KEY}".`);
    return;
  }

  const board = parseBoardState(stored);
  if (!board) {
    throw new Error(
      "The stored board failed validation — inspect it by hand before migrating.",
    );
  }

  const rows = BOARD_COLUMNS.flatMap((column) =>
    board[column.id].map((card, position) => ({
      id: card.id,
      column: column.id as string,
      position,
      title: card.title,
      note: card.note ?? null,
      tag: card.tag ?? null,
      url: card.url ?? null,
      progress: card.progress ?? null,
      updatedAt: new Date(card.updatedAt),
    })),
  );

  console.log(`Found ${rows.length} card(s) in Redis:`);
  for (const row of rows) {
    console.log(`  [${row.column}#${row.position}] ${row.title}`);
  }

  if (!write) {
    console.log("\nDry run — pass --write to apply.");
    return;
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    for (const row of rows) {
      await prisma.boardCard.upsert({
        where: { id: row.id },
        create: row,
        update: row,
      });
    }
    console.log(`\nWrote ${rows.length} card(s) to Postgres.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
