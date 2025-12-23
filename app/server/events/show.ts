import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

export const getEvent = createServerFn()
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const database = getDatabase();

    const event = await database
      .selectFrom("events")
      .leftJoin("locations", "events.location_id", "locations.id")
      .select([
        "events.id",
        "events.name",
        "events.emoji",
        "events.external_id",
        "events.slug",
        "events.description",
        "events.url",
        "events.start_at",
        "events.end_at",
        "events.created_at",
        "events.location_id",
        "locations.id as location_id_ref",
        "locations.name as location_name",
        "locations.address as location_address",
      ])
      .where("events.id", "=", id)
      .executeTakeFirst();

    if (!event) throw new Error("Event not found");

    // Structure the response with nested location object
    const {
      location_id,
      location_id_ref,
      location_name,
      location_address,
      ...eventData
    } = event;

    return {
      ...eventData,
      location: location_id
        ? {
            id: location_id_ref!,
            name: location_name,
            address: location_address,
          }
        : null,
    };
  });
