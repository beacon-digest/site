import { createServerFn } from "@tanstack/react-start";
import { fromZonedTime } from "date-fns-tz";
import { getDatabase } from "../../../db/database";
import { requireAdminPermission } from "../auth/require-admin";

const TIME_ZONE = "America/New_York";
const PAGE_SIZE = 25;

const EVENT_COLUMNS = [
  "events.id",
  "events.name",
  "events.emoji",
  "events.slug",
  "events.description",
  "events.url",
  "events.location_id",
  "events.start_at",
  "events.end_at",
  "events.status",
  "events.organization_id",
  "events.admin_locked",
  "events.external_id",
  "events.created_at",
  "locations.name as location_name",
] as const;

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// datetime-local strings ("YYYY-MM-DDTHH:mm") are entered in the event's local
// (New York) time; store them as UTC to match the rest of the app.
function toUtc(local: string | null | undefined): Date | null {
  if (!local) return null;
  return fromZonedTime(local, TIME_ZONE);
}

export type EventInput = {
  name: string;
  emoji?: string | null;
  slug?: string | null;
  description?: string | null;
  url?: string | null;
  location_id?: number | null;
  start_at: string;
  end_at?: string | null;
};

function validateEventInput<T extends EventInput>(data: T): T {
  if (!data || typeof data.name !== "string" || data.name.trim() === "") {
    throw new Error("Event name is required");
  }
  if (!data.start_at) {
    throw new Error("Event start time is required");
  }
  return data;
}

export const listEventsAdmin = createServerFn({ method: "GET" })
  .inputValidator((data?: { q?: string; page?: number }) => data ?? {})
  .handler(async ({ data }) => {
    await requireAdminPermission("events:read");
    const database = getDatabase();
    const page = data.page ?? 0;

    let base = database
      .selectFrom("events")
      .leftJoin("locations", "events.location_id", "locations.id");

    if (data.q) {
      base = base.where("events.name", "ilike", `%${data.q}%`);
    }

    const [rows, countRow] = await Promise.all([
      base
        .select(EVENT_COLUMNS)
        .orderBy("events.start_at", "desc")
        .limit(PAGE_SIZE)
        .offset(page * PAGE_SIZE)
        .execute(),
      base
        .select(database.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ]);

    return {
      events: rows,
      total: Number(countRow.count),
      page,
      pageSize: PAGE_SIZE,
    };
  });

export const getEventByIdAdmin = createServerFn({ method: "GET" })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await requireAdminPermission("events:read");
    const database = getDatabase();

    const event = await database
      .selectFrom("events")
      .leftJoin("locations", "events.location_id", "locations.id")
      .select(EVENT_COLUMNS)
      .where("events.id", "=", id)
      .executeTakeFirst();

    if (!event) throw new Error("Event not found");
    return event;
  });

export const createEventAdmin = createServerFn({ method: "POST" })
  .inputValidator(validateEventInput)
  .handler(async ({ data }) => {
    await requireAdminPermission("events:write");
    const database = getDatabase();

    const result = await database
      .insertInto("events")
      .values({
        name: data.name.trim(),
        emoji: data.emoji ?? null,
        slug: data.slug?.trim() || makeSlug(data.name),
        description: data.description ?? null,
        url: data.url ?? null,
        location_id: data.location_id ?? null,
        start_at: toUtc(data.start_at),
        end_at: toUtc(data.end_at),
        external_id: null,
        // Staff-created events are platform-owned and published immediately.
        organization_id: null,
        status: "published",
        // Protect from the Notion sync.
        admin_locked: true,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    return { id: result.id };
  });

export const updateEventAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: EventInput & { id: number }) => {
    validateEventInput(data);
    if (typeof data.id !== "number") throw new Error("Event id is required");
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdminPermission("events:write");
    const database = getDatabase();

    await database
      .updateTable("events")
      .set({
        name: data.name.trim(),
        emoji: data.emoji ?? null,
        slug: data.slug?.trim() || makeSlug(data.name),
        description: data.description ?? null,
        url: data.url ?? null,
        location_id: data.location_id ?? null,
        start_at: toUtc(data.start_at),
        end_at: toUtc(data.end_at),
        // Mark as admin-edited so the Notion sync won't overwrite it.
        admin_locked: true,
      })
      .where("id", "=", data.id)
      .execute();

    return { id: data.id };
  });

export const deleteEventAdmin = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    await requireAdminPermission("events:delete");
    const database = getDatabase();
    await database.deleteFrom("events").where("id", "=", id).execute();
    return { id };
  });

export const listLocationsAdmin = createServerFn({ method: "GET" }).handler(
  async () => {
    await requireAdminPermission("events:read");
    const database = getDatabase();
    return database
      .selectFrom("locations")
      .select(["id", "name", "address"])
      .orderBy("name", "asc")
      .execute();
  },
);
