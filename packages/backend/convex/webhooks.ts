import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

export const markClerkEventProcessed = internalMutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    receivedAt: v.number(),
  },
  handler: async (ctx, { eventId, eventType, receivedAt }) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_provider_event_id", (q) => q.eq("provider", "clerk").eq("eventId", eventId))
      .unique();

    if (existing) {
      return { accepted: false as const };
    }

    await ctx.db.insert("webhookEvents", {
      provider: "clerk",
      eventId,
      eventType,
      receivedAt,
      processedAt: Date.now(),
    });

    return { accepted: true as const };
  },
});
