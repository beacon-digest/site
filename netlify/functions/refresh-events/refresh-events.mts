import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { Client } from "@notionhq/client";
import { fromZonedTime } from "date-fns-tz";
import { addDays, formatISO, startOfDay } from "date-fns";
import { NeonDialect } from "kysely-neon";
import ws from "ws";
import { Kysely } from "kysely";
import { NotionToMarkdown } from "notion-to-md";
import Showdown from "showdown";

interface EventsTable {
  id: number;
  name: string | null;
  emoji: string | null;
  slug: string | null;
  description: string | null;
  external_id: string | null;
  url: string | null;
  location_id: number | null;
  start_at: Date | null;
  end_at: Date | null;
  created_at: Date;
}

interface LocationsTable {
  id: number;
  name: string;
  address: string | null;
  website: string | null;
  created_at: Date;
}

interface Database {
  events: EventsTable;
  locations: LocationsTable;
}

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

interface ProcessingProgress {
  lastRunTime: string;
  totalEventsFound: number;
  processedEventIds: string[];
  currentIndex: number;
  startedAt: string;
  lastCheckpoint: string;
}

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
  address: string | null
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
  notionClient: Client,
  n2m: NotionToMarkdown,
  converter: any,
  eventId: string
): Promise<string | null> {
  try {
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
    console.warn(`Failed to convert page content for ${eventId}:`, error);
  }
  return null;
}

async function processEvent(
  event: NotionEvent,
  db: Kysely<Database>,
  notion: Client,
  n2m: NotionToMarkdown,
  converter: any,
  skipContentConversion: boolean = false
): Promise<void> {
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
      locationData.name
    );
    locationId = await findOrCreateLocation(db, locationName, address);
  }

  // Get page content - skip if requested to save time
  let description = null;
  if (!skipContentConversion) {
    description = await convertNotionContent(notion, n2m, converter, event.id);

    // Fallback to simple text extraction if conversion failed
    if (!description) {
      description =
        event.properties.Description?.rich_text
          ?.map((item) => item.plain_text)
          .join("") || null;
    }
  }

  const dateData = event.properties.Date?.date;
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
      `Updated event: ${name || externalId} ${emoji ? `(${emoji})` : ""}`
    );
  } else {
    // Insert new event
    await db.insertInto("events").values(eventData).execute();

    console.log(
      `Created event: ${name || externalId} ${emoji ? `(${emoji})` : ""}`
    );
  }
}

async function getAllFuturePublishedEventIds(
  notion: Client,
  databaseId: string
): Promise<Set<string>> {
  const now = new Date();
  const filter = {
    and: [
      { property: "Published", checkbox: { equals: true } },
      { property: "Date", date: { on_or_after: formatISO(now) } },
    ],
  };

  const response = await notion.databases.query({
    database_id: databaseId,
    filter,
  });

  const events = response.results as unknown as NotionEvent[];
  return new Set(events.map((e) => e.id));
}

export default async (req: Request, context: Context) => {
  const startTime = Date.now();
  const maxExecutionTime = 25000; // 25 seconds to leave buffer

  try {
    const body = (await req.json()) as { next_run?: string };
    const next_run = body.next_run || "";

    console.log("Starting event refresh. Next invocation at:", next_run);

    // Check for required environment variables
    // Note: Environment variables must be set with "Functions" scope in Netlify
    const notionApiKey = process.env.NOTION_API_KEY?.trim();
    const notionDatabaseId = process.env.NOTION_DATABASE_ID?.trim();
    const databaseUrl = process.env.VITE_DATABASE_URL?.trim();

    // Debug logging (without exposing sensitive values)
    console.log("Environment variable check:", {
      hasNotionApiKey: !!notionApiKey,
      hasNotionDatabaseId: !!notionDatabaseId,
      hasDatabaseUrl: !!databaseUrl,
      notionApiKeyLength: notionApiKey?.length || 0,
      allEnvKeys: Object.keys(process.env).filter(
        (k) => k.includes("NOTION") || k.includes("DATABASE")
      ),
    });

    const missingVars: string[] = [];
    if (!notionApiKey || notionApiKey.length === 0) {
      missingVars.push("NOTION_API_KEY");
    }
    if (!notionDatabaseId || notionDatabaseId.length === 0) {
      missingVars.push("NOTION_DATABASE_ID");
    }
    if (!databaseUrl || databaseUrl.length === 0) {
      missingVars.push("VITE_DATABASE_URL");
    }

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(", ")}. Please ensure these are set in your Netlify site settings (Site settings → Build & Deploy → Environment variables) with "Functions" scope enabled. After setting, you may need to redeploy the function.`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // At this point, we know these are non-empty strings
    const validatedNotionApiKey = notionApiKey as string;
    const validatedNotionDatabaseId = notionDatabaseId as string;
    const validatedDatabaseUrl = databaseUrl as string;

    // Initialize clients
    const notion = new Client({ auth: validatedNotionApiKey });
    const n2m = new NotionToMarkdown({ notionClient: notion });
    const converter = new Showdown.Converter();

    const dialect = new NeonDialect({
      connectionString: validatedDatabaseUrl,
      webSocketConstructor: ws,
    });
    const db = new Kysely<Database>({ dialect });

    // Get Netlify Blob store for tracking progress
    const store = getStore("refresh-events");
    const currentTimestamp = new Date().toISOString();

    // Load existing progress
    const progressBlob = await store.get("current-progress");
    let progress: ProcessingProgress | null = progressBlob
      ? JSON.parse(progressBlob.toString())
      : null;

    let lastRunTime: string | null = null;

    if (progress) {
      // Resume from existing progress
      lastRunTime = progress.lastRunTime;
      console.log(
        `Resuming from checkpoint: ${progress.processedEventIds.length}/${progress.totalEventsFound} events processed`
      );
    } else {
      // Get last run timestamp from blob storage
      const lastRunBlob = await store.get("last-run-timestamp");
      lastRunTime = lastRunBlob ? lastRunBlob.toString() : null;
      console.log(
        `Starting fresh run. Last completed run: ${lastRunTime || "Never"}`
      );
    }

    // Determine what events to query
    let filter: any;
    if (lastRunTime) {
      // Query events updated since last run that are in the future
      const now = new Date();
      filter = {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Date", date: { on_or_after: formatISO(now) } },
          {
            timestamp: "last_edited_time",
            last_edited_time: { on_or_after: lastRunTime },
          },
        ],
      };
    } else {
      // First run - get all future events
      const now = new Date();
      filter = {
        and: [
          { property: "Published", checkbox: { equals: true } },
          { property: "Date", date: { on_or_after: formatISO(now) } },
        ],
      };
    }

    console.log("Querying Notion database...");

    // Query Notion database
    const response = await notion.databases.query({
      database_id: validatedNotionDatabaseId,
      filter,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
    });

    const allEvents = response.results as unknown as NotionEvent[];
    console.log(`Found ${allEvents.length} total events in Notion`);

    // Filter out already processed events
    const unprocessedEvents = progress
      ? allEvents.filter(
          (event) => !progress.processedEventIds.includes(event.id)
        )
      : allEvents;

    console.log(`${unprocessedEvents.length} events need processing`);

    if (unprocessedEvents.length === 0) {
      // Nothing to do, update timestamp and exit
      await store.set("last-run-timestamp", currentTimestamp);
      if (progress) {
        await store.delete("current-progress");
      }

      // Run deletion detection even when no events to process
      let deletedCount = 0;
      const timeRemaining = maxExecutionTime - (Date.now() - startTime);
      const minTimeForDeletion = 2000;

      if (timeRemaining > minTimeForDeletion) {
        try {
          // Query all future published events from Notion (not just recently edited ones)
          const currentNotionIds = await getAllFuturePublishedEventIds(
            notion,
            validatedNotionDatabaseId
          );
          console.log(
            `Deletion check: Found ${currentNotionIds.size} future published events in Notion`
          );

          const dbNotionEvents = await db
            .selectFrom("events")
            .select(["id", "external_id", "name"])
            .where("external_id", "like", "notion-%")
            .where("start_at", ">=", new Date())
            .execute();

          console.log(
            `Deletion check: Found ${dbNotionEvents.length} future Notion events in database`
          );

          const eventsToDelete = dbNotionEvents.filter((event) => {
            const notionId = event.external_id?.replace("notion-", "");
            return notionId && !currentNotionIds.has(notionId);
          });

          // Safety check: warn if attempting to delete suspiciously many events
          if (eventsToDelete.length > 10) {
            console.warn(
              `WARNING: Attempting to delete ${eventsToDelete.length} events. This seems high. Aborting deletion for safety.`
            );
          } else if (eventsToDelete.length > 0) {
            for (const event of eventsToDelete) {
              await db
                .deleteFrom("events")
                .where("id", "=", event.id)
                .execute();
              deletedCount++;
              console.log(`Deleted event: ${event.name || event.external_id}`);
            }

            console.log(
              `Deletion phase completed: ${deletedCount} events deleted`
            );
          }
        } catch (error) {
          console.error("Error during deletion detection:", error);
        }
      }

      return new Response(
        JSON.stringify({
          message: "No events to process",
          next_run,
          timestamp: currentTimestamp,
          stats: {
            eventsProcessed: 0,
            eventsCreated: 0,
            eventsUpdated: 0,
            eventsDeleted: deletedCount,
            totalFound: allEvents.length,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize or update progress tracking
    if (!progress) {
      progress = {
        lastRunTime: lastRunTime || currentTimestamp,
        totalEventsFound: allEvents.length,
        processedEventIds: [],
        currentIndex: 0,
        startedAt: currentTimestamp,
        lastCheckpoint: currentTimestamp,
      };
    }

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const checkpointInterval = 3; // Checkpoint every 3 events
    const skipContentConversion = unprocessedEvents.length > 10; // Skip slow content conversion if many events

    if (skipContentConversion) {
      console.log(
        "Skipping content conversion due to large batch size for performance"
      );
    }

    // Process events with time-based checkpointing
    for (let i = 0; i < unprocessedEvents.length; i++) {
      // Check if we're running out of time
      if (Date.now() - startTime > maxExecutionTime) {
        console.log(
          `Approaching timeout limit, stopping at ${processedCount} events processed`
        );
        break;
      }

      const event = unprocessedEvents[i];

      try {
        // Check if event exists before processing
        const existingEvent = await db
          .selectFrom("events")
          .select("id")
          .where("external_id", "=", `notion-${event.id}`)
          .executeTakeFirst();

        // Process single event
        await processEvent(
          event,
          db,
          notion,
          n2m,
          converter,
          skipContentConversion
        );

        if (existingEvent) {
          updatedCount++;
        } else {
          createdCount++;
        }

        // Add to processed list
        progress.processedEventIds.push(event.id);
        progress.currentIndex = i + 1;
        progress.lastCheckpoint = new Date().toISOString();
        processedCount++;

        // Checkpoint at intervals or after slow operations
        if (
          processedCount % checkpointInterval === 0 ||
          !skipContentConversion
        ) {
          await store.set("current-progress", JSON.stringify(progress));
          console.log(
            `Checkpoint: ${processedCount}/${unprocessedEvents.length} events processed`
          );
        }
      } catch (error) {
        console.error(`Failed to process event ${event.id}:`, error);
        // Continue with next event rather than failing entire job
        continue;
      }
    }

    // Final checkpoint
    await store.set("current-progress", JSON.stringify(progress));

    // Deletion detection phase
    let deletedCount = 0;
    const timeRemaining = maxExecutionTime - (Date.now() - startTime);
    const minTimeForDeletion = 2000; // 2 seconds minimum

    if (timeRemaining > minTimeForDeletion) {
      try {
        // Query all future published events from Notion (not just recently edited ones)
        const currentNotionIds = await getAllFuturePublishedEventIds(
          notion,
          validatedNotionDatabaseId
        );
        console.log(
          `Deletion check: Found ${currentNotionIds.size} future published events in Notion`
        );

        // Query DB for future Notion events
        const dbNotionEvents = await db
          .selectFrom("events")
          .select(["id", "external_id", "name"])
          .where("external_id", "like", "notion-%")
          .where("start_at", ">=", new Date())
          .execute();

        console.log(
          `Deletion check: Found ${dbNotionEvents.length} future Notion events in database`
        );

        // Find events to delete
        const eventsToDelete = dbNotionEvents.filter((event) => {
          const notionId = event.external_id?.replace("notion-", "");
          return notionId && !currentNotionIds.has(notionId);
        });

        // Safety check: warn if attempting to delete suspiciously many events
        if (eventsToDelete.length > 10) {
          console.warn(
            `WARNING: Attempting to delete ${eventsToDelete.length} events. This seems high. Aborting deletion for safety.`
          );
        } else if (eventsToDelete.length > 0) {
          // Delete orphaned events
          for (const event of eventsToDelete) {
            await db.deleteFrom("events").where("id", "=", event.id).execute();
            deletedCount++;
            console.log(`Deleted event: ${event.name || event.external_id}`);
          }

          console.log(
            `Deletion phase completed: ${deletedCount} events deleted`
          );
        }
      } catch (error) {
        console.error("Error during deletion detection:", error);
      }
    } else {
      console.log("Skipping deletion detection due to time constraints");
    }

    // Check if job completed successfully
    const isComplete = processedCount === unprocessedEvents.length;

    if (isComplete) {
      // Update last run timestamp and clean up progress
      await store.set("last-run-timestamp", currentTimestamp);
      await store.delete("current-progress");

      console.log(
        `Job completed successfully: ${processedCount} events processed (${createdCount} created, ${updatedCount} updated, ${deletedCount} deleted)`
      );

      return new Response(
        JSON.stringify({
          message: "Event refresh completed successfully",
          next_run,
          timestamp: currentTimestamp,
          stats: {
            eventsProcessed: processedCount,
            eventsCreated: createdCount,
            eventsUpdated: updatedCount,
            eventsDeleted: deletedCount,
            totalFound: allEvents.length,
            completed: true,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      console.log(
        `Job partially completed: ${processedCount}/${unprocessedEvents.length} events processed (${createdCount} created, ${updatedCount} updated, ${deletedCount} deleted), will resume next time`
      );

      return new Response(
        JSON.stringify({
          message: "Event refresh partially completed, will resume next run",
          next_run,
          timestamp: currentTimestamp,
          stats: {
            eventsProcessed: processedCount,
            eventsCreated: createdCount,
            eventsUpdated: updatedCount,
            eventsDeleted: deletedCount,
            totalFound: allEvents.length,
            totalRemaining: unprocessedEvents.length - processedCount,
            completed: false,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing scheduled event:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process scheduled event",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config: Config = {
  schedule: "@hourly",
};
