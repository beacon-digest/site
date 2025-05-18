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

// Query to get events for a specific date, with location data included
export const getEventsByDate = query({
  args: {
    date: v.string(), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    // Convert the date string to start and end timestamps for the day
    const startDate = new Date(args.date);
    const endDate = new Date(args.date);
    endDate.setDate(endDate.getDate() + 1);

    // Get events for the specified date
    const events = await ctx.db
      .query("events")
      .filter((q) =>
        q.and(
          q.gte(q.field("startDate"), startDate.getTime()),
          q.lt(q.field("startDate"), endDate.getTime()),
        ),
      )
      .order("asc")
      .collect();

    // Efficiently get all referenced locations in one batch
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

    // Add location data to each event
    const eventsWithLocations = events.map((event) => ({
      ...event,
      location: event.locationId ? locationsMap[event.locationId] : null,
    }));

    return {
      date: startDate.getTime(),
      displayDate: startDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      events: eventsWithLocations,
    };
  },
});
