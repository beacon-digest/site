import { Client } from "@notionhq/client";
import { fromZonedTime } from "date-fns-tz";
import { formatISO } from "date-fns";
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

export const dialect = new NeonDialect({
  connectionString: process.env.VITE_DATABASE_URL,
  webSocketConstructor: ws,
});

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
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const converter = new Showdown.Converter();
  const db = new Kysely<Database>({
    dialect,
  });

  const TIME_ZONE = "America/New_York";

  function parseNotionDate(dateString: string): Date {
    // If date-only format (YYYY-MM-DD), add time component
    const dateTimeString = dateString.includes("T")
      ? dateString
      : `${dateString}T00:00:00`;
    const naiveDate = new Date(dateTimeString);
    // Interpret the date as if it's in America/New_York timezone and convert to UTC
    return fromZonedTime(naiveDate, TIME_ZONE);
  }

  // Get the start of the target day in the specified timezone
  const dayStartNY = new Date(dateString + "T00:00:00");
  const dayEndNY = new Date(dateString + "T23:59:59.999");
  
  // Convert NY timezone boundaries to UTC Date objects
  const dayStart = fromZonedTime(dayStartNY, TIME_ZONE);
  const dayEnd = fromZonedTime(dayEndNY, TIME_ZONE);

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

    console.log(response.results[0]);

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

      // Handle location
      let locationId: number | null = null;
      const locationData = notionEvent.properties.Location?.select;
      if (locationData?.name) {
        const { name: locationName, address } = await parseLocationInfo(
          locationData.name,
        );
        locationId = await findOrCreateLocation(db, locationName, address);
        console.log(
          `Location: ${locationName}${address ? ` (${address})` : ""} [ID: ${locationId}]`,
        );
      }

      // Get page content as markdown and convert to HTML
      let description = null;
      try {
        const mdBlocks = await n2m.pageToMarkdown(notionEvent.id);
        const mdString = n2m.toMarkdownString(mdBlocks);

        // Handle different return types from toMarkdownString
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
          description = converter.makeHtml(markdownContent);
        }
      } catch (error) {
        console.warn(
          `Failed to convert page content for ${notionEvent.id}:`,
          error,
        );
        // Fallback to simple text extraction
        description =
          notionEvent.properties.Description?.rich_text
            ?.map((item) => item.plain_text)
            .join("") || null;
      }

      const dateData = notionEvent.properties.Date?.date;
      const startAt = dateData?.start ? parseNotionDate(dateData.start) : null;
      const endAt = dateData?.end ? parseNotionDate(dateData.end) : null;

      // Generate slug from name
      const slug = name
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
        : null;

      // Get URL from Website property
      const url = notionEvent.properties.Website?.url || null;

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
          `Updated event: ${name || externalId} ${emoji ? `(${emoji})` : ""} ${locationId ? `at location ID ${locationId}` : ""}`,
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
