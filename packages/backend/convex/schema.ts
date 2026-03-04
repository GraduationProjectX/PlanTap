import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const eventType = v.union(v.literal("event"), v.literal("activity"));
const eventStatus = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"));
const indoorOutdoor = v.union(
  v.literal("indoor"),
  v.literal("outdoor"),
  v.literal("mixed"),
  v.literal("unknown"),
);

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

  events: defineTable({
    title: v.string(),
    titleAr: v.string(),
    descriptionShort: v.optional(v.string()),
    descriptionShortAr: v.optional(v.string()),
    type: eventType,
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    city: v.string(),
    locationLat: v.number(),
    locationLng: v.number(),
    locationAddress: v.optional(v.string()),
    locationAddressAr: v.optional(v.string()),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    indoorOutdoor,
    familyFriendly: v.optional(v.boolean()),
    images: v.array(v.string()),
    favoritesCount: v.number(),
    status: eventStatus,
    rating: v.optional(v.number()),
  })
    .index("by_type_status", ["type", "status"])
    .index("by_city_type", ["city", "type"])
    .index("by_status", ["status"]),

  categories: defineTable({
    key: v.string(),
    label: v.string(),
    labelAr: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
  }).index("by_key", ["key"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"]),
});
