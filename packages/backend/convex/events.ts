import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * List approved events, optionally filtered by city.
 * Used by the AI suggestion engine to get candidate events.
 */
export const listApproved = query({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { city, limit }) => {
    let q = ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "approved"));

    const all = await q.collect();

    // Client-side city filter (index is on status; city filter happens here)
    const filtered = city ? all.filter((e) => e.city === city) : all;

    return filtered.slice(0, limit ?? 50);
  },
});

/**
 * Get a single event by ID.
 */
export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
