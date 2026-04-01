import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    displayName: v.string(),
    locale: v.union(v.literal("ar"), v.literal("en")),
    city: v.optional(v.string()),
    email: v.union(v.string(), v.null()),
    firstName: v.union(v.string(), v.null()),
    lastName: v.union(v.string(), v.null()),
    avatarUrl: v.optional(v.union(v.string(), v.null())),
    updatedAt: v.number(),
    isBanned: v.optional(v.boolean()),
    preferences: v.optional(
      v.object({
        likedTags: v.array(v.string()),
        dislikedTags: v.array(v.string())
      })
    ),
    defaults: v.optional(v.object({
      budgetMin: v.optional(v.number()),
      budgetMax: v.optional(v.number()),
      radiusKm: v.optional(v.number()),
      groupType: v.optional(v.union(v.literal("solo"), v.literal("group"), v.literal("kids"))),
      indoorOutdoor: v.optional(v.union(v.literal("indoor"), v.literal("outdoor"), v.literal("mixed"), v.literal("any")))
    })),
    pushToken: v.optional(v.string()),
    onboardingCompleteAt: v.optional(v.number()),
    lastActiveAt: v.optional(v.number()),
  }).index("by_clerk_user_id", ["clerkUserId"]),

  events: defineTable({
    title: v.string(),
    titleAr: v.optional(v.string()),
    descriptionShort: v.optional(v.union(v.string(), v.null())),
    descriptionShortAr: v.optional(v.union(v.string(), v.null())),
    type: v.union(v.literal("event"), v.literal("activity")),
    cellId: v.string(),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    favoritesCount: v.number(),
    city: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
      addressAr: v.optional(v.string())
    }),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    indoorOutdoor: v.optional(v.union(v.literal("indoor"), v.literal("outdoor"), v.literal("mixed"), v.literal("any"))),
    bookingRequired: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    operatingHours: v.optional(v.array(v.object({
      day: v.number(),
      open: v.string(),
      close: v.string(),
    }))),
    duration: v.optional(v.number()),
    provider: v.union(v.literal("visitsaudi"), v.literal("ticketmaster"), v.literal("eventbrite"), v.literal("places"), v.literal("scraped"), v.literal("manual")),
    bookingUrl: v.optional(v.string()),
    providerUrl: v.optional(v.string()),
    familyFriendly: v.optional(v.boolean()),
    images: v.array(v.id("_storage")), //wip
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    audit: v.object({
      createdBy: v.optional(v.string()),
      reviewedBy: v.optional(v.string()),
      reviewedAt: v.optional(v.number()),
      sourceUrl: v.optional(v.string()),
      confidence: v.optional(v.number())
    }),
    updatedAt: v.number()
  }).index("by_city_and_cell",["city","cellId"]),

  plans: defineTable({
    title: v.string(),
    userId: v.id("users"),
    time: v.number(),
    status: v.union(v.literal("draft"), v.literal("saved"), v.literal("completed")),
    stops: v.array(v.object({
      eventId: v.id("events"),
      note: v.optional(v.string()),
      order: v.number()
    })),
    constraintsSnapshot: v.object({
      budgetMin: v.optional(v.number()),
      budgetMax: v.optional(v.number()),
      radiusKm: v.optional(v.number()),
      city: v.optional(v.string()),
      groupType: v.optional(v.string()),
      indoorOutdoor: v.optional(v.string()),
      timeStart: v.optional(v.number()),
      timesEnd: v.optional(v.number()),
      tags: v.array(v.string()),
    }),
    startLocation: v.object({
      lat: v.number(),
      lng: v.number(),
    }),

    shareId: v.string(),
    startAt: v.optional(v.number()),
  }).index("by_user_Ids",["userId"]),

  favorites: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),

  }).index("by_userid_and_eventId",["userId", "eventId"]),

  feedback: defineTable({
    userId: v.optional(v.id("users")),
    message: v.string(),
    status: v.union(v.literal("open"), v.literal("closed"))
  }).index("by_userid",["userId"]),

  reports: defineTable({
    reporterUserId: v.id("users"),
    targetType: v.union(v.literal("event"), v.literal("user"), v.literal("report")),
    targetId: v.string(),
    details: v.optional(v.string()),
    reason: v.string(),
    
    status: v.union(v.literal("open"), v.literal("resolved"), v.literal("dismissed"))
  }).index("by_reporterUserId",["reporterUserId"]),

  cities: defineTable({
    name: v.string(),
    nameAr: v.string(),
    lat: v.number(),
    lng: v.number(),
    active: v.boolean()
  }).index("by_city_name",["name"]),

  adminActions: defineTable({
    adminUserId: v.id("users"),
    action: v.union(v.literal("approve"), v.literal("reject"), v.literal("edit"),
    v.literal("ban"), v.literal("merge"), v.literal("import")),
    targetType: v.union(v.literal("event"), v.literal("user"), v.literal("report")),
    targetId: v.string(),
    details: v.optional(v.any())
  }).index("by_adminUserId_and_targetId",["adminUserId","targetId"]),

});
