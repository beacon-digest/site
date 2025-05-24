import { Client } from "@notionhq/client";
import { toZonedTime } from "date-fns-tz";
import { addDays, formatISO, startOfDay } from "date-fns";
import { NeonDialect } from "kysely-neon";
import ws from "ws";
import { Kysely } from "kysely";
import { Database } from "../db/database";
import { config } from "dotenv";

config({ path: ".env.local" });

interface NotionEvent {
  id: string;
  icon?: {
    type: "emoji";
    emoji: string;
  } | null;
  properties: {
    Name?: { title: { plain_text: string }[] };
    Emoji?: { rich_text: { plain_text: string }[] };
    Description?: { rich_text: { plain_text: string }[] };
    Date?: { date: { start: string; end?: string } };
    [key: string]: any;
  };
}

export const dialect = new NeonDialect({
  connectionString: process.env.VITE_DATABASE_URL,
  webSocketConstructor: ws,
});

async function syncNotionEvents(dateString: string) {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    console.error(
      "Invalid date format. Please use YYYY-MM-DD format (e.g., 2025-05-24)",
    );
    process.exit(1);
  }

  // Check for required environment variables
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey) {
    console.error("NOTION_API_KEY environment variable is required");
    process.exit(1);
  }

  if (!notionDatabaseId) {
    console.error("NOTION_DATABASE_ID environment variable is required");
    process.exit(1);
  }

  const notion = new Client({ auth: notionApiKey });
  const db = new Kysely<Database>({
    dialect,
  });

  const TIME_ZONE = "America/New_York";

  // Get the start of the target day in the specified timezone
  const zonedTargetDate = toZonedTime(dateString, TIME_ZONE);
  const dayStart = startOfDay(zonedTargetDate);
  const dayEnd = startOfDay(addDays(zonedTargetDate, 1));

  try {
    console.log(`Syncing Notion events for date: ${dateString}`);

    // Query Notion database for events on the specified date
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      filter: {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Date", date: { on_or_after: formatISO(dayStart) } },
          { property: "Date", date: { before: formatISO(dayEnd) } },
        ],
      },
    });

    console.log(`Found ${response.results.length} events in Notion`);

    for (const page of response.results) {
      const notionEvent = page as unknown as NotionEvent;
      const externalId = `notion-${notionEvent.id}`;

      // Check if event already exists
      const existingEvent = await db
        .selectFrom("events")
        .selectAll()
        .where("external_id", "=", externalId)
        .executeTakeFirst();

      const name = notionEvent.properties.Name?.title?.[0]?.plain_text || null;

      // Get emoji from page icon first, fall back to properties
      const emoji =
        notionEvent.icon?.type === "emoji" ? notionEvent.icon.emoji : null;

      const description =
        notionEvent.properties.Description?.rich_text
          ?.map((item) => item.plain_text)
          .join("") || null;

      const dateData = notionEvent.properties.Date?.date;
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

      const eventData = {
        name,
        emoji,
        slug,
        description,
        external_id: externalId,
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
          `Updated event: ${name || externalId} ${emoji ? `(${emoji})` : ""}`,
        );
      } else {
        // Insert new event
        await db.insertInto("events").values(eventData).execute();

        console.log(
          `Created event: ${name || externalId} ${emoji ? `(${emoji})` : ""}`,
        );
      }
    }

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Error syncing Notion events:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Get date from command line arguments
const dateArg = process.argv[2];
if (!dateArg) {
  console.error("Usage: tsx scripts/sync-notion-events.ts <date>");
  console.error("Example: tsx scripts/sync-notion-events.ts 2025-05-24");
  process.exit(1);
}

syncNotionEvents(dateArg);
