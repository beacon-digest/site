import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";
import { fromZonedTime } from "date-fns-tz";

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
      // Calculate day boundaries in NY timezone
      // Parse the date string as if it's in America/New_York timezone
      // fromZonedTime interprets a Date's components as if they're in the specified timezone and returns UTC
      const dayStartNY = new Date(date + "T00:00:00");
      const dayEndNY = new Date(date + "T23:59:59.999");
      
      // Convert NY timezone boundaries to UTC Date objects for database comparison
      const dayStart = fromZonedTime(dayStartNY, TIME_ZONE);
      const dayEnd = fromZonedTime(dayEndNY, TIME_ZONE);

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
          "events.url",
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
