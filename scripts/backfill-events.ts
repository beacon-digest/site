import { Client } from "@notionhq/client";
import { toZonedTime } from "date-fns-tz";
import { addDays, formatISO, startOfDay } from "date-fns";
import { NeonDialect } from "kysely-neon";
import ws from "ws";
import { Kysely } from "kysely";
import { Database } from "../db/database";
import { config } from "dotenv";
import { NotionToMarkdown } from "notion-to-md";
import Showdown from "showdown";

config({ path: ".env.local" });

interface NotionEvent {
  id: string;
  last_edited_time: string;
  icon?: {
    type: "emoji";
    emoji: string;
  } | null;
  properties: {
    Name?: { title: { plain_text: string }[] };
    Emoji?: { rich_text: { plain_text: string }[] };
    Description?: { rich_text: { plain_text: string }[] };
    Date?: { date: { start: string; end?: string } };
    Location?: { select: { name: string } | null };
    Website?: { url: string | null };
    [key: string]: any;
  };
}

const TIME_ZONE = "America/New_York";

async function parseLocationInfo(locationString: string): Promise<{
  name: string;
  address: string | null;
}> {
  // Check if location has address in parentheses: "Foo Bar (123 Main Street)"
  const match = locationString.match(/^(.+?)\s*\((.+)\)$/);

  if (match) {
    return {
      name: match[1].trim(),
      address: match[2].trim(),
    };
  }

  // Just the name without address
  return {
    name: locationString.trim(),
    address: null,
  };
}

async function findOrCreateLocation(
  db: Kysely<Database>,
  locationName: string,
  address: string | null,
): Promise<number> {
  // First, try to find existing location by name
  const existingLocation = await db
    .selectFrom("locations")
    .selectAll()
    .where("name", "=", locationName)
    .executeTakeFirst();

  if (existingLocation) {
    // Update address if it's different and the new one is not null
    if (address && existingLocation.address !== address) {
      await db
        .updateTable("locations")
        .set({ address })
        .where("id", "=", existingLocation.id)
        .execute();
    }
    return existingLocation.id;
  }

  // Create new location
  const result = await db
    .insertInto("locations")
    .values({
      name: locationName,
      address,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  return result.id;
}

async function convertNotionContent(
  n2m: NotionToMarkdown,
  converter: Showdown.Converter,
  eventId: string,
): Promise<string | null> {
  try {
    console.log(`  Converting content for event ${eventId}...`);
    const mdBlocks = await n2m.pageToMarkdown(eventId);
    const mdString = n2m.toMarkdownString(mdBlocks);

    let markdownContent = "";
    if (typeof mdString === "string") {
      markdownContent = mdString;
    } else if (
      mdString &&
      typeof mdString === "object" &&
      "parent" in mdString &&
      typeof mdString.parent === "string"
    ) {
      markdownContent = mdString.parent;
    }

    if (markdownContent && markdownContent.trim()) {
      return converter.makeHtml(markdownContent);
    }
  } catch (error) {
    console.warn(`  Failed to convert page content for ${eventId}:`, error);
  }
  return null;
}

async function processEvent(
  event: NotionEvent,
  db: Kysely<Database>,
  n2m: NotionToMarkdown,
  converter: Showdown.Converter,
  includeContent: boolean = true,
): Promise<{ created: boolean }> {
  const externalId = `notion-${event.id}`;

  // Check if event already exists
  const existingEvent = await db
    .selectFrom("events")
    .selectAll()
    .where("external_id", "=", externalId)
    .executeTakeFirst();

  const name = event.properties.Name?.title?.[0]?.plain_text || null;

  // Get emoji from page icon first, fall back to properties
  const emoji = event.icon?.type === "emoji" ? event.icon.emoji : null;

  // Handle location
  let locationId: number | null = null;
  const locationData = event.properties.Location?.select;
  if (locationData?.name) {
    const { name: locationName, address } = await parseLocationInfo(
      locationData.name,
    );
    locationId = await findOrCreateLocation(db, locationName, address);
    console.log(
      `  Location: ${locationName}${address ? ` (${address})` : ""} [ID: ${locationId}]`,
    );
  }

  // Get page content as markdown and convert to HTML
  let description = null;
  if (includeContent) {
    description = await convertNotionContent(n2m, converter, event.id);

    // Fallback to simple text extraction if conversion failed
    if (!description) {
      description =
        event.properties.Description?.rich_text
          ?.map((item) => item.plain_text)
          .join("") || null;
    }
  } else {
    // Use simple text extraction
    description =
      event.properties.Description?.rich_text
        ?.map((item) => item.plain_text)
        .join("") || null;
  }

  const dateData = event.properties.Date?.date;
  const startAt = dateData?.start ? new Date(dateData.start) : null;
  const endAt = dateData?.end ? new Date(dateData.end) : null;

  // Generate slug from name
  const slug = name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : null;

  // Get URL from Website property
  const url = event.properties.Website?.url || null;

  const eventData = {
    name,
    emoji,
    slug,
    description,
    external_id: externalId,
    url,
    location_id: locationId,
    start_at: startAt,
    end_at: endAt,
  };

  if (existingEvent) {
    // Update existing event
    await db
      .updateTable("events")
      .set(eventData)
      .where("id", "=", existingEvent.id)
      .execute();

    console.log(
      `  Updated: ${name || externalId} ${emoji ? `(${emoji})` : ""}`,
    );
    return { created: false };
  } else {
    // Insert new event
    await db.insertInto("events").values(eventData).execute();

    console.log(
      `  Created: ${name || externalId} ${emoji ? `(${emoji})` : ""}`,
    );
    return { created: true };
  }
}

async function backfillEvents(includeContent: boolean = true) {
  console.log("🚀 Starting event backfill...");
  console.log(`Content conversion: ${includeContent ? "ENABLED" : "DISABLED"}`);

  // Check for required environment variables
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;
  const databaseUrl = process.env.VITE_DATABASE_URL;

  if (!notionApiKey) {
    console.error("❌ NOTION_API_KEY environment variable is required");
    process.exit(1);
  }

  if (!notionDatabaseId) {
    console.error("❌ NOTION_DATABASE_ID environment variable is required");
    process.exit(1);
  }

  if (!databaseUrl) {
    console.error("❌ VITE_DATABASE_URL environment variable is required");
    process.exit(1);
  }

  // Initialize clients
  const notion = new Client({ auth: notionApiKey });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const converter = new Showdown.Converter();

  const dialect = new NeonDialect({
    connectionString: databaseUrl,
    webSocketConstructor: ws,
  });

  const db = new Kysely<Database>({
    dialect,
  });

  try {
    console.log("📅 Querying Notion database for all future events...");

    // Get all future published events with pagination
    const now = new Date();
    const allEvents: NotionEvent[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;
    let pageCount = 0;

    while (hasMore) {
      pageCount++;
      console.log(`  Fetching page ${pageCount}...`);

      const response = await notion.databases.query({
        database_id: notionDatabaseId,
        filter: {
          and: [
            { property: "Published", checkbox: { equals: true } },
            { property: "Date", date: { on_or_after: formatISO(now) } },
          ],
        },
        sorts: [
          {
            property: "Date",
            direction: "ascending",
          },
        ],
        page_size: 100,
        start_cursor: startCursor,
      });

      const pageEvents = response.results as unknown as NotionEvent[];
      allEvents.push(...pageEvents);

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;

      console.log(
        `  Page ${pageCount}: ${pageEvents.length} events found (total: ${allEvents.length})`,
      );
    }

    console.log(
      `📊 Found ${allEvents.length} future events across ${pageCount} pages to process`,
    );

    if (allEvents.length === 0) {
      console.log("✅ No events to backfill");
      return;
    }

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    console.log("\n🔄 Processing events...\n");

    // Process events one by one with detailed logging
    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i];
      const eventName =
        event.properties.Name?.title?.[0]?.plain_text || "Unnamed Event";

      console.log(`[${i + 1}/${allEvents.length}] Processing: ${eventName}`);

      try {
        const result = await processEvent(
          event,
          db,
          n2m,
          converter,
          includeContent,
        );

        if (result.created) {
          createdCount++;
        } else {
          updatedCount++;
        }

        processedCount++;
      } catch (error) {
        console.error(`  ❌ Error processing event ${event.id}:`, error);
        errorCount++;
        // Continue processing other events
      }

      // Progress update every 10 events
      if ((i + 1) % 10 === 0 || i === allEvents.length - 1) {
        console.log(
          `\n📈 Progress: ${i + 1}/${allEvents.length} events processed`,
        );
        console.log(
          `   Created: ${createdCount}, Updated: ${updatedCount}, Errors: ${errorCount}\n`,
        );
      }
    }

    console.log("🎉 Backfill completed!");
    console.log(`📊 Final Statistics:`);
    console.log(`   Total events found: ${allEvents.length}`);
    console.log(`   Successfully processed: ${processedCount}`);
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} events had errors but backfill continued`);
    }
  } catch (error) {
    console.error("💥 Fatal error during backfill:", error);
    process.exit(1);
  } finally {
    // Clean up database connection
    await db.destroy();
  }

  process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
const skipContent = args.includes("--skip-content") || args.includes("--fast");

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Event Backfill Script

Usage: tsx scripts/backfill-events.ts [options]

Options:
  --skip-content, --fast    Skip Notion content conversion (faster but no descriptions)
  --help, -h               Show this help message

Examples:
  tsx scripts/backfill-events.ts                    # Full backfill with content
  tsx scripts/backfill-events.ts --skip-content     # Fast backfill without descriptions
  tsx scripts/backfill-events.ts --fast             # Same as --skip-content
`);
  process.exit(0);
}

// Run the backfill
backfillEvents(!skipContent);
