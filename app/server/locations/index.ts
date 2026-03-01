import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";

export const getLocations = createServerFn().handler(async () => {
  const database = getDatabase();
  const now = new Date();

  // Only return locations that have upcoming events
  return database
    .selectFrom("locations")
    .innerJoin("events", "events.location_id", "locations.id")
    .select(["locations.id", "locations.name", "locations.address"])
    .where("events.start_at", ">=", now)
    .distinct()
    .orderBy("locations.name", "asc")
    .execute();
});
