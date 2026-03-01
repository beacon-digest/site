import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

export const searchEvents = createServerFn()
  .validator((data: { q?: string; locationIds?: number[] }) => data)
  .handler(async ({ data: { q, locationIds } }) => {
    const database = getDatabase();

    const now = new Date();

    let query = database
      .selectFrom("events")
      .leftJoin("locations", "events.location_id", "locations.id")
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
      .where("start_at", ">=", now)
      .orderBy("start_at", "asc");

    if (q) {
      query = query.where("events.name", "ilike", `%${q}%`);
    }

    if (locationIds && locationIds.length > 0) {
      query = query.where("events.location_id", "in", locationIds);
    }

    return query.execute().then((events) =>
      events.map((event) => {
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
      })
    );
  });
