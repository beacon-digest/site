import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.query("events").take(args.limit);
  },
});
