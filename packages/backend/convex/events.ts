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
import { ConvexError, v } from "convex/values";

import { query } from "./_generated/server";
import { eventFields } from "./schema";

const eventValidator = v.object({
  _id: v.id("events"),
  _creationTime: v.number(),
  ...eventFields,
});

const MAX_EVENTS = 200;

export const list = query({
  args: {
    city: v.optional(v.string()),
  },
  returns: v.array(eventValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    if (args.city !== undefined) {
      const city = args.city;
      return await ctx.db
        .query("events")
        .withIndex("by_city_and_status", (q) => q.eq("city", city))
        .filter((q) => q.eq(q.field("status"), "approved"))
        .take(MAX_EVENTS);
    }

    return await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .take(MAX_EVENTS);
  },
});

export const getById = query({
  args: { id: v.id("events") },
  returns: v.union(eventValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event || event.status !== "approved") {
      return null;
    }

    return event;
  },
});
