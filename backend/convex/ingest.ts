import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { eventDataValidator, eventFields } from "./schema";

export const ingestEvent = internalMutation({
  args: {
    eventData: v.object({
      ...eventFields,
    }),
  },
  handler: async (ctx, args) => {
    const { eventData } = args;

    const externalSource = eventData.externalSource;
    const externalId = eventData.externalId;

    if (externalSource && externalId) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_external", (q) => q.eq("externalSource", externalSource).eq("externalId", externalId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, eventData);
        return existing._id;
      }
    }

    const id = await ctx.db.insert("events", {
      ...eventData,
      externalSource: externalSource ?? null,
      externalId: externalId ?? null,
    });

    return id;
  },
});

export const ingestEvents = internalMutation({
  args: {
    eventsData: v.array(eventDataValidator),
  },
  handler: async (ctx, args) => {
    const ids = [];

    for (const eventData of args.eventsData) {
      const externalSource = eventData.externalSource;
      const externalId = eventData.externalId;

      if (externalSource && externalId) {
        const existing = await ctx.db
          .query("events")
          .withIndex("by_external", (q) => q.eq("externalSource", externalSource).eq("externalId", externalId))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, eventData);
          ids.push(existing._id);
          continue;
        }
      }

      ids.push(
        await ctx.db.insert("events", {
          ...eventData,
          externalSource: externalSource ?? null,
          externalId: externalId ?? null,
        }),
      );
    }

    return ids;
  },
});
