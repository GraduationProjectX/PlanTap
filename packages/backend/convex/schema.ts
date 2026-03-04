import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.union(v.string(), v.null()),
    firstName: v.union(v.string(), v.null()),
    lastName: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
    locale: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_user_id", ["clerkUserId"]),
  webhookEvents: defineTable({
    provider: v.literal("clerk"),
    eventId: v.string(),
    eventType: v.string(),
    receivedAt: v.number(),
    processedAt: v.number(),
  }).index("by_provider_event_id", ["provider", "eventId"]),
});
