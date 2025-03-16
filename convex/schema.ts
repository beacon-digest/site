import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	events: defineTable({
		name: v.string(),
		createdAt: v.optional(v.number()),
	}),
});
