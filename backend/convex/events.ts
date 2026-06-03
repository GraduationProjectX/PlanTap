import { v } from "convex/values";

import { query } from "./_generated/server";
import { eventFields } from "./schema";

const eventValidator = v.object({
  _id: v.id("events"),
  _creationTime: v.number(),
  ...eventFields,
});

const DEFAULT_EVENTS_LIMIT = 500;
const MAX_EVENTS_LIMIT = 1000;

function normalizeLimit(limit: number | undefined) {
  if (limit == null) {
    return DEFAULT_EVENTS_LIMIT;
  }

  return Math.max(1, Math.min(limit, MAX_EVENTS_LIMIT));
}

export const list = query({
  args: {
    city: v.optional(v.string()),
    type: v.optional(v.union(v.literal("event"), v.literal("activity"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(eventValidator),
  handler: async (ctx, args) => {
    const limit = normalizeLimit(args.limit);

    if (args.city !== undefined) {
      const city = args.city;
      const events = await ctx.db
        .query("events")
        .withIndex("by_city_and_status", (q) => q.eq("city", city).eq("status", "approved"))
        .take(limit);

      return args.type === undefined ? events : events.filter((event) => event.type === args.type);
    }

    if (args.type !== undefined) {
      const eventType = args.type;

      return await ctx.db
        .query("events")
        .withIndex("by_type_and_status", (q) => q.eq("type", eventType).eq("status", "approved"))
        .take(limit);
    }

    return await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .take(limit);
  },
});

export const getById = query({
  args: { id: v.id("events") },
  returns: v.union(eventValidator, v.null()),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event || event.status !== "approved") {
      return null;
    }

    return event;
  },
});

export const listApproved = query({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(eventValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;

    if (args.city !== undefined) {
      const city = args.city;
      return await ctx.db
        .query("events")
        .withIndex("by_city_and_status", (q) => q.eq("city", city))
        .filter((q) => q.eq(q.field("status"), "approved"))
        .take(limit);
    }

    return await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .take(limit);
  },
});
