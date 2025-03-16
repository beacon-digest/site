import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
	args: {
		limit: v.number(),
	},
	handler: async (ctx, args) => {
		return ctx.db.query("events").take(args.limit);
	},
});
