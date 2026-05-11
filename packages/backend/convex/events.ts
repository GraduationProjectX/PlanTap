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
        .withIndex("by_city_and_status", (q) => q.eq("city", city).eq("status", "approved"))
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

export const listApproved = query({
  args: {
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(eventValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const limit = args.limit ?? 50;

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
