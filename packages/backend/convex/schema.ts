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
    city: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        likedTags: v.array(v.string()),
        dislikedTags: v.array(v.string()),
      }),
    ),
    defaults: v.optional(
      v.object({
        budgetMin: v.optional(v.number()),
        budgetMax: v.optional(v.number()),
        radiusKm: v.optional(v.number()),
        groupType: v.optional(
          v.union(
            v.literal("solo"),
            v.literal("group"),
            v.literal("kids"),
          ),
        ),
        indoorOutdoor: v.optional(
          v.union(
            v.literal("indoor"),
            v.literal("outdoor"),
            v.literal("mixed"),
            v.literal("any"),
          ),
        ),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_user_id", ["clerkUserId"]),

  events: defineTable({
    title: v.string(),
    titleAr: v.optional(v.string()),
    descriptionShort: v.optional(v.string()),
    descriptionShortAr: v.optional(v.string()),
    type: v.union(v.literal("event"), v.literal("activity")),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    city: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
      addressAr: v.optional(v.string()),
    }),
    cellId: v.string(),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    indoorOutdoor: v.union(
      v.literal("indoor"),
      v.literal("outdoor"),
      v.literal("mixed"),
      v.literal("unknown"),
    ),
    familyFriendly: v.optional(v.boolean()),
    bookingRequired: v.optional(v.boolean()),
    bookingUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    duration: v.optional(v.number()),
    provider: v.union(
      v.literal("visitsaudi"),
      v.literal("ticketmaster"),
      v.literal("eventbrite"),
      v.literal("places"),
      v.literal("scraped"),
      v.literal("manual"),
    ),
    providerUrl: v.optional(v.string()),
    images: v.array(v.id("_storage")),
    favoritesCount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    updatedAt: v.number(),
  })
    .index("by_city_cell", ["city", "cellId"])
    .index("by_status", ["status"]),

  plans: defineTable({
    userId: v.id("users"),
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("saved"),
      v.literal("completed"),
    ),
    stops: v.array(
      v.object({
        eventId: v.id("events"),
        note: v.optional(v.string()),
        order: v.number(),
      }),
    ),
    startAt: v.optional(v.number()),
    startLocation: v.optional(
      v.object({ lat: v.number(), lng: v.number() }),
    ),
    shareId: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  favorites: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    createdAt: v.number(),
  }).index("by_user_event", ["userId", "eventId"]),
});
