import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";
import { startOfDay, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const getEvents = createServerFn()
  .validator((date: string) => date)
  .handler(async ({ data: date }) => {
    const database = getDatabase();

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(
        `Invalid date format: ${date}. Expected YYYY-MM-DD format.`,
      );
    }

    const TIME_ZONE = "America/New_York";

    try {
      // Parse the date string directly in NY timezone to avoid UTC conversion issues
      const zonedDate = toZonedTime(date, TIME_ZONE);

      // Validate the parsed date
      if (isNaN(zonedDate.getTime())) {
        throw new Error(`Invalid date: ${date}`);
      }

      const dayStart = startOfDay(zonedDate);
      const dayEnd = endOfDay(zonedDate);

      // Validate the calculated dates
      if (isNaN(dayStart.getTime()) || isNaN(dayEnd.getTime())) {
        throw new Error(`Failed to calculate day bounds for date: ${date}`);
      }

      return database
        .selectFrom("events")
        .leftJoin("locations", "events.location_id", "locations.id")
        .select([
          "events.id",
          "events.name",
          "events.emoji",
          "events.slug",
          "events.description",
          "events.external_id",
          "events.location_id",
          "events.start_at",
          "events.end_at",
          "events.created_at",
          "locations.id as location_id_val",
          "locations.name as location_name",
          "locations.address as location_address",
        ])
        .where("start_at", ">=", dayStart)
        .where("start_at", "<=", dayEnd)
        .orderBy("start_at", "asc")
        .execute()
        .then((events) =>
          events.map((event) => {
            const {
              location_id_val,
              location_name,
              location_address,
              ...eventData
            } = event;

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
          }),
        );
    } catch (error) {
      console.error(`Error processing date ${date}:`, error);
      throw error;
    }
  });
