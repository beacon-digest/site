import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Helper function to generate timestamps for dates
const getTimestamp = (
  year: number,
  month: number, // 1-12
  day: number,
  hour = 0,
  minute = 0
): number => {
  return new Date(year, month - 1, day, hour, minute).getTime();
};

// Seed both locations and events in a single mutation
export const seedDatabase = mutation({
  handler: async (ctx) => {
    const currentYear = new Date().getFullYear();
    const nextMonth = new Date().getMonth() + 2; // Use next month for examples
    const monthValue = nextMonth > 12 ? nextMonth - 12 : nextMonth;
    const yearValue = nextMonth > 12 ? currentYear + 1 : currentYear;

    // Create sample locations
    const locations = [
      {
        name: "Howland Public Library",
        address: "313 Main Street",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "City Hall",
        address: "1 Municipal Plaza",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Stanza Books",
        address: "508 Main St",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Hudson Valley Food Hall",
        address: "288 Main Street",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Happy Valley",
        address: "296 Main Street",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Beacon Rec Center",
        address: "23 West Center Street",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Beacon Music Factory",
        address: "333 Fishkill Avenue",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "12 Hanna Lane",
        address: "12 Hanna Lane",
        city: "Beacon",
        state: "NY",
        zipCode: "12508",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Virtual (Zoom)",
        address: "Online",
        city: "Virtual",
        state: "",
        zipCode: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const locationMap = {};

    // Insert locations and store their IDs
    for (const location of locations) {
      const locationId = await ctx.db.insert("locations", location);
      locationMap[location.name] = locationId;
    }

    // Create sample events with locations from our seed data
    const events = [
      {
        name: "Come & Play",
        description: "Drop-in play session for kids of all ages.",
        startDate: getTimestamp(yearValue, monthValue, 17, 10, 0),
        endDate: getTimestamp(yearValue, monthValue, 17, 11, 30),
        locationId: locationMap["Howland Public Library"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Chess Club (For Grades 3-12)",
        description:
          "Learn and play chess with peers and mentors. Open to students in grades 3-12.",
        startDate: getTimestamp(yearValue, monthValue, 17, 16, 0),
        endDate: getTimestamp(yearValue, monthValue, 17, 17, 0),
        locationId: locationMap["Howland Public Library"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "City Council Meeting",
        description:
          "Regular meeting of the Beacon City Council. Open to the public.",
        startDate: getTimestamp(yearValue, monthValue, 17, 19, 0),
        locationId: locationMap["City Hall"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Sci-Fi Book Club",
        description:
          "Monthly book club discussion of science fiction literature.",
        startDate: getTimestamp(yearValue, monthValue, 17, 19, 0),
        endDate: getTimestamp(yearValue, monthValue, 17, 20, 30),
        locationId: locationMap["Stanza Books"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Mahjong 103",
        description:
          "Learn to play Mahjong or join experienced players for a game.",
        startDate: getTimestamp(yearValue, monthValue, 17, 19, 0),
        endDate: getTimestamp(yearValue, monthValue, 17, 21, 0),
        locationId: locationMap["Hudson Valley Food Hall"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Free Breakfast for Anyone in Need (Beacon's Backyard)",
        description:
          "Community breakfast service for those in need. All are welcome.",
        startDate: getTimestamp(yearValue, monthValue, 18, 6, 30),
        endDate: getTimestamp(yearValue, monthValue, 18, 10, 30),
        locationId: locationMap["12 Hanna Lane"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Fiber Arts Circle",
        description:
          "Knitting, crocheting, and other fiber arts. Bring your project and join the circle.",
        startDate: getTimestamp(yearValue, monthValue, 18, 10, 0),
        endDate: getTimestamp(yearValue, monthValue, 18, 11, 30),
        locationId: locationMap["Howland Public Library"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Know Your Rights Public Utility Webinar",
        description:
          "Learn about your rights as a utility consumer and how to address common issues.",
        startDate: getTimestamp(yearValue, monthValue, 18, 18, 0),
        endDate: getTimestamp(yearValue, monthValue, 18, 19, 30),
        locationId: locationMap["Virtual (Zoom)"],
        url: "https://zoom.us/j/examplelink",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Disaster Preparedness Training",
        description:
          "Community training on preparation for natural disasters and emergencies.",
        startDate: getTimestamp(yearValue, monthValue, 18, 18, 0),
        endDate: getTimestamp(yearValue, monthValue, 18, 19, 0),
        locationId: locationMap["Howland Public Library"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Beacon Endurance Beer Run & Walk",
        description:
          "Casual 5K run/walk ending with craft beer tasting. All fitness levels welcome.",
        startDate: getTimestamp(yearValue, monthValue, 18, 18, 5),
        locationId: locationMap["Happy Valley"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Avian Influenza: The Latest Updates and What It Means for Poultry Health",
        description:
          "Educational webinar about recent avian influenza developments and poultry health implications.",
        startDate: getTimestamp(yearValue, monthValue, 18, 18, 30),
        endDate: getTimestamp(yearValue, monthValue, 18, 20, 0),
        locationId: locationMap["Virtual (Zoom)"],
        url: "https://zoom.us/j/poultryhealth",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Geeks Who Drink Trivia",
        description: "Weekly pub trivia night with fun themes and prizes.",
        startDate: getTimestamp(yearValue, monthValue, 18, 18, 30),
        locationId: locationMap["Happy Valley"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        name: "Tabletop Tuesdays",
        description:
          "Board game night for adults. Bring your own or play from our collection.",
        startDate: getTimestamp(yearValue, monthValue, 18, 19, 30),
        endDate: getTimestamp(yearValue, monthValue, 18, 22, 30),
        locationId: locationMap["Beacon Music Factory"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    // Insert all events
    const eventIds: Id<"events">[] = [];
    for (const event of events) {
      const eventId = await ctx.db.insert("events", event);
      eventIds.push(eventId);
    }

    return {
      message: "Database seeded successfully",
      locationsCreated: locations.length,
      eventsCreated: events.length,
    };
  },
});
