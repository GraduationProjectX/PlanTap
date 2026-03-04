import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events;

    if (args.city) {
      events = await ctx.db
        .query("events")
        .withIndex("by_city_type", (q) => q.eq("city", args.city!))
        .collect();
    } else {
      events = await ctx.db
        .query("events")
        .withIndex("by_status", (q) => q.eq("status", "approved"))
        .collect();
    }

    return events.filter((e) => e.status === "approved");
  },
});

export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
