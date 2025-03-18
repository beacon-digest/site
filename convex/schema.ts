import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Locations table
  locations: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),

  // Events table
  events: defineTable({
    name: v.string(),
    createdAt: v.optional(v.number()),
  }),
});
