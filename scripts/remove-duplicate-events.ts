import { NeonDialect } from "kysely-neon";
import ws from "ws";
import { Kysely, sql } from "kysely";
import { Database } from "../db/database";
import { config } from "dotenv";

config({ path: ".env.local" });

async function removeDuplicateEvents(execute: boolean) {
  const databaseUrl = process.env.VITE_DATABASE_URL;

  if (!databaseUrl) {
    console.error("VITE_DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const dialect = new NeonDialect({
    connectionString: databaseUrl,
    webSocketConstructor: ws,
  });

  const db = new Kysely<Database>({ dialect });

  try {
    // Find duplicate groups: events with the same name + start_at
    const duplicates = await sql<{
      name: string;
      start_at: string;
      count: number;
      ids: string;
    }>`
      SELECT name, start_at, COUNT(*) as count,
        STRING_AGG(id::text, ',' ORDER BY id) as ids
      FROM events
      WHERE name IS NOT NULL AND start_at IS NOT NULL
      GROUP BY name, start_at
      HAVING COUNT(*) > 1
      ORDER BY name, start_at
    `.execute(db);

    if (duplicates.rows.length === 0) {
      console.log("No duplicate events found.");
      return;
    }

    console.log(`Found ${duplicates.rows.length} groups of duplicate events:\n`);

    let totalToDelete = 0;

    for (const group of duplicates.rows) {
      const ids = group.ids.split(",").map(Number);
      const keepId = ids[0]; // Keep the lowest ID (oldest)
      const deleteIds = ids.slice(1);
      totalToDelete += deleteIds.length;

      console.log(`  "${group.name}" at ${group.start_at}`);
      console.log(`    ${group.count} copies — keep ID ${keepId}, delete IDs: ${deleteIds.join(", ")}`);
    }

    console.log(`\nTotal events to delete: ${totalToDelete}`);

    if (!execute) {
      console.log("\nDry run complete. Use --execute to actually delete duplicates.");
      return;
    }

    console.log("\nDeleting duplicates...\n");

    let deletedCount = 0;

    for (const group of duplicates.rows) {
      const ids = group.ids.split(",").map(Number);
      const deleteIds = ids.slice(1);

      for (const id of deleteIds) {
        await db.deleteFrom("events").where("id", "=", id).execute();
        deletedCount++;
        console.log(`  Deleted event ID ${id}: "${group.name}"`);
      }
    }

    console.log(`\nDone. Deleted ${deletedCount} duplicate events.`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await db.destroy();
  }

  process.exit(0);
}

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Remove Duplicate Events Script

Finds and removes duplicate events that share the same name and start time.
Keeps the event with the lowest ID (oldest) in each duplicate group.

Usage: tsx scripts/remove-duplicate-events.ts [options]

Options:
  --execute    Actually delete duplicates (without this flag, runs in dry-run mode)
  --help, -h   Show this help message

Examples:
  tsx scripts/remove-duplicate-events.ts              # Dry run: show what would be deleted
  tsx scripts/remove-duplicate-events.ts --execute    # Actually delete duplicates
`);
  process.exit(0);
}

const execute = args.includes("--execute");
removeDuplicateEvents(execute);
