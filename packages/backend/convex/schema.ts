import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const nullableString = v.union(v.string(), v.null());
export const nullableNumber = v.union(v.number(), v.null());
export const nullableBoolean = v.union(v.boolean(), v.null());

export const eventTypeValidator = v.union(v.literal("event"), v.literal("activity"));
export const eventStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);
export const indoorOutdoorValidator = v.union(
  v.literal("indoor"),
  v.literal("outdoor"),
  v.literal("mixed"),
  v.literal("unknown"),
);
export const reviewRatingValidator = v.union(
  v.literal(1),
  v.literal(2),
  v.literal(3),
  v.literal(4),
  v.literal(5),
);

export const userFields = {
  clerkUserId: v.string(),
  email: nullableString,
  firstName: nullableString,
  lastName: nullableString,
  imageUrl: nullableString,
  locale: nullableString,
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
};

export const webhookEventFields = {
  provider: v.literal("clerk"),
  eventId: v.string(),
  eventType: v.string(),
  receivedAt: v.number(),
  processedAt: v.number(),
};

export const eventFields = {
  title: v.string(),
  titleAr: v.string(),
  descriptionShort: nullableString,
  descriptionShortAr: nullableString,
  type: eventTypeValidator,
  categories: v.array(v.string()),
  tags: v.array(v.string()),
  startAt: nullableNumber,
  endAt: nullableNumber,
  city: v.string(),
  locationLat: v.number(),
  locationLng: v.number(),
  locationAddress: nullableString,
  locationAddressAr: nullableString,
  priceMin: nullableNumber,
  priceMax: nullableNumber,
  indoorOutdoor: indoorOutdoorValidator,
  familyFriendly: nullableBoolean,
  images: v.array(v.string()),
  favoritesCount: v.number(),
  status: eventStatusValidator,
  rating: nullableNumber,
};

export const categoryFields = {
  key: v.string(),
  label: v.string(),
  labelAr: v.string(),
  icon: v.string(),
  sortOrder: v.number(),
};

export const bookmarkFields = {
  userId: v.id("users"),
  eventId: v.id("events"),
  createdAt: v.number(),
};

export const reviewFields = {
  eventId: v.id("events"),
  userId: v.id("users"),
  rating: reviewRatingValidator,
  body: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export default defineSchema({
  users: defineTable(userFields).index("by_clerkuserid", ["clerkUserId"]),

  webhookEvents: defineTable(webhookEventFields).index("by_provider_and_eventid", [
    "provider",
    "eventId",
  ]),

  events: defineTable(eventFields)
    .index("by_type_and_status", ["type", "status"])
    .index("by_city_and_status", ["city", "status"])
    .index("by_status", ["status"]),

  categories: defineTable(categoryFields)
    .index("by_key", ["key"])
    .index("by_sortorder", ["sortOrder"]),

  bookmarks: defineTable(bookmarkFields)
    .index("by_userid_and_eventid", ["userId", "eventId"])
    .index("by_userid_and_createdat", ["userId", "createdAt"]),

  reviews: defineTable(reviewFields)
    .index("by_eventid_and_createdat", ["eventId", "createdAt"])
    .index("by_userid_and_eventid", ["userId", "eventId"]),
});
