import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

const PAGE_SIZE = 25;

export const searchEvents = createServerFn()
  .inputValidator((data: { q?: string; locationIds?: number[]; page?: number }) => data)
  .handler(async ({ data: { q, locationIds, page = 0 } }) => {
    const database = getDatabase();

    const now = new Date();

    let baseQuery = database
      .selectFrom("events")
      .leftJoin("locations", "events.location_id", "locations.id")
      .where("start_at", ">=", now);

    if (q) {
      baseQuery = baseQuery.where("events.name", "ilike", `%${q}%`);
    }

    if (locationIds && locationIds.length > 0) {
      baseQuery = baseQuery.where("events.location_id", "in", locationIds);
    }

    const [rows, countRow] = await Promise.all([
      baseQuery
        .select([
          "events.id",
          "events.name",
          "events.emoji",
          "events.slug",
          "events.description",
          "events.external_id",
          "events.url",
          "events.location_id",
          "events.start_at",
          "events.end_at",
          "events.created_at",
          "locations.id as location_id_val",
          "locations.name as location_name",
          "locations.address as location_address",
        ])
        .orderBy("start_at", "asc")
        .limit(PAGE_SIZE)
        .offset(page * PAGE_SIZE)
        .execute(),
      baseQuery
        .select(database.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ]);

    const events = rows.map((event) => {
      const { location_id_val, location_name, location_address, ...eventData } =
        event;

      return {
        ...eventData,
        location: location_id_val
          ? {
              id: location_id_val,
              name: location_name,
              address: location_address,
            }
          : null,
      };
    });

    return { events, total: Number(countRow.count) };
  });
