import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "../../../db/database";
import { fromZonedTime } from "date-fns-tz";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export const getEvents = createServerFn()
  .inputValidator((date: string) => date)
  .handler(async ({ data: date }) => {
    const database = getDatabase();

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(
        `Invalid date format: ${date}. Expected YYYY-MM-DD format.`
      );
    }

    const TIME_ZONE = "America/New_York";

    try {
      // Calculate day boundaries in NY timezone
      // Parse the date string as if it's in America/New_York timezone
      // fromZonedTime interprets a Date's components as if they're in the specified timezone and returns UTC
      const dayStartNY = new Date(`${date}T00:00:00`);
      const dayEndNY = new Date(`${date}T23:59:59.999`);

      // Convert NY timezone boundaries to UTC Date objects for database comparison
      const dayStart = fromZonedTime(dayStartNY, TIME_ZONE);
      const dayEnd = fromZonedTime(dayEndNY, TIME_ZONE);

      // Validate the calculated dates
      if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
        throw new Error(`Failed to calculate day bounds for date: ${date}`);
      }

      return database
        .selectFrom("events")
        .leftJoin("locations", "events.location_id", "locations.id")
        .where("events.status", "=", "published")
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
          })
        );
    } catch (error) {
      console.error(`Error processing date ${date}:`, error);
      throw error;
    }
  });

export const getMonthEvents = createServerFn()
  .inputValidator((month: string) => month)
  .handler(async ({ data: month }) => {
    const database = getDatabase();

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      throw new Error(
        `Invalid month format: ${month}. Expected YYYY-MM format.`
      );
    }

    const TIME_ZONE = "America/New_York";

    try {
      // Parse the month string (YYYY-MM format)
      const [year, monthNum] = month.split("-").map(Number);

      // Create Date objects representing the start of the month and start of next month in NY timezone
      // We construct these as if they're in NY timezone (year, month, day components)
      // fromZonedTime will then convert them to UTC
      const monthStartNY = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
      const nextMonthStartNY = new Date(year, monthNum, 1, 0, 0, 0, 0);

      // Convert NY timezone boundaries to UTC Date objects for database comparison
      // fromZonedTime interprets the Date object's components as if they're in the specified timezone
      const monthStart = fromZonedTime(monthStartNY, TIME_ZONE);
      const monthEnd = fromZonedTime(nextMonthStartNY, TIME_ZONE);

      // Validate the calculated dates
      if (
        Number.isNaN(monthStart.getTime()) ||
        Number.isNaN(monthEnd.getTime())
      ) {
        throw new Error(`Failed to calculate month bounds for month: ${month}`);
      }

      return database
        .selectFrom("events")
        .leftJoin("locations", "events.location_id", "locations.id")
        .where("events.status", "=", "published")
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
        .where("start_at", ">=", monthStart)
        .where("start_at", "<", monthEnd)
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
          })
        );
    } catch (error) {
      console.error(`Error processing month ${month}:`, error);
      throw error;
    }
  });

export const getDateRangeEvents = createServerFn()
  .inputValidator((data: { startDate: string; endDate: string }) => data)
  .handler(async ({ data: { startDate, endDate } }) => {
    const database = getDatabase();

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error(
        "Invalid date format. Expected YYYY-MM-DD format for both startDate and endDate."
      );
    }

    const TIME_ZONE = "America/New_York";

    try {
      // Calculate date boundaries in NY timezone
      // Parse the date strings as if they're in America/New_York timezone
      const rangeStartNY = new Date(`${startDate}T00:00:00`);
      const rangeEndNY = new Date(`${endDate}T23:59:59.999`);

      // Convert NY timezone boundaries to UTC Date objects for database comparison
      const rangeStart = fromZonedTime(rangeStartNY, TIME_ZONE);
      const rangeEnd = fromZonedTime(rangeEndNY, TIME_ZONE);

      // Validate the calculated dates
      if (
        Number.isNaN(rangeStart.getTime()) ||
        Number.isNaN(rangeEnd.getTime())
      ) {
        throw new Error(
          `Failed to calculate date range bounds for ${startDate} to ${endDate}`
        );
      }

      return database
        .selectFrom("events")
        .leftJoin("locations", "events.location_id", "locations.id")
        .where("events.status", "=", "published")
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
        .where("start_at", ">=", rangeStart)
        .where("start_at", "<=", rangeEnd)
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
          })
        );
    } catch (error) {
      console.error(
        `Error processing date range ${startDate} to ${endDate}:`,
        error
      );
      throw error;
    }
  });
