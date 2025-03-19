import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export const get = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.query("events").take(args.limit);
  },
});

// Query to get events within a specified date range, with location data included
export const getEventsByDateRange = query({
  args: {
    startDate: v.number(), // Unix timestamp for range start
    endDate: v.number(), // Unix timestamp for range end
  },
  handler: async (ctx, args) => {
    // Get events in date range sorted by start date
    const events = await ctx.db
      .query("events")
      .filter((q) =>
        q.and(
          q.gte(q.field("startDate"), args.startDate),
          q.lte(q.field("startDate"), args.endDate)
        )
      )
      .order("asc")
      .collect();

    // Efficiently get all referenced locations in one batch
    // First, collect unique location IDs
    const locationIds = new Set<Id<"locations">>();
    for (const event of events) {
      if (event.locationId) {
        locationIds.add(event.locationId);
      }
    }

    // Create a map for efficient lookups
    const locationsMap: Record<string, Doc<"locations">> = {};

    // Fetch each location by ID
    for (const locationId of locationIds) {
      const location = await ctx.db.get(locationId);
      if (location) {
        locationsMap[locationId] = location;
      }
    }

    // Group by date (using date string as key)
    const eventsByDate: Record<
      string,
      {
        date: number;
        displayDate: string;
        events: Array<Doc<"events"> & { location: Doc<"locations"> | null }>;
      }
    > = {};

    for (const event of events) {
      // Convert timestamp to date string (e.g., "2025-03-17")
      const date = new Date(event.startDate);
      const dateString = date.toISOString().split("T")[0];

      // Create the date entry if it doesn't exist
      if (!eventsByDate[dateString]) {
        eventsByDate[dateString] = {
          date: event.startDate, // Store timestamp for sorting
          displayDate: date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          events: [],
        };
      }

      // Add the event with its location data
      eventsByDate[dateString].events.push({
        ...event,
        // Attach the location data directly to avoid additional lookups
        location: event.locationId ? locationsMap[event.locationId] : null,
      });
    }

    // Convert to array and sort by date
    const sortedDates = Object.values(eventsByDate).sort(
      (a, b) => a.date - b.date
    );

    return sortedDates;
  },
});
