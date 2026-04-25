import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getOptionalCurrentUser, requireCurrentUser } from "./lib/auth";
import { nullableString, reviewRatingValidator } from "./schema";

const reviewSummaryValidator = v.object({
  id: v.id("reviews"),
  authorName: v.string(),
  authorImageUrl: nullableString,
  rating: reviewRatingValidator,
  body: v.string(),
  createdAt: v.number(),
});

const viewerReviewValidator = v.object({
  id: v.id("reviews"),
  rating: reviewRatingValidator,
  body: v.string(),
});

const eventReviewsValidator = v.object({
  averageRating: v.number(),
  reviewCount: v.number(),
  reviews: v.array(reviewSummaryValidator),
  viewerReview: v.union(viewerReviewValidator, v.null()),
});

function getAuthorName(user: {
  firstName: string | null;
  lastName: string | null;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (fullName.length > 0) {
    return fullName;
  }

  return "PlanTap User";
}

function roundAverageRating(total: number, count: number) {
  if (count === 0) {
    return 0;
  }

  return Math.round((total / count) * 10) / 10;
}

const MAX_REVIEW_BODY_LENGTH = 2000;

export const getForEvent = query({
  args: { eventId: v.id("events") },
  returns: eventReviewsValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event || event.status !== "approved") {
      return {
        averageRating: 0,
        reviewCount: 0,
        reviews: [],
        viewerReview: null,
      };
    }

    const currentUser = await getOptionalCurrentUser(ctx);
    const eventReviews = await ctx.db
      .query("reviews")
      .withIndex("by_eventid_and_createdat", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();

    const reviews = await Promise.all(
      eventReviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          id: review._id,
          authorName: user ? getAuthorName(user) : "PlanTap User",
          authorImageUrl: user?.imageUrl ?? null,
          rating: review.rating,
          body: review.body,
          createdAt: review.createdAt,
        };
      }),
    );

    const ratingTotal = eventReviews.reduce((total, review) => total + review.rating, 0);
    const currentUserReview = currentUser
      ? eventReviews.find((review) => review.userId === currentUser._id) ?? null
      : null;

    return {
      averageRating: roundAverageRating(ratingTotal, eventReviews.length),
      reviewCount: eventReviews.length,
      reviews,
      viewerReview: currentUserReview
        ? {
            id: currentUserReview._id,
            rating: currentUserReview.rating,
            body: currentUserReview.body,
          }
        : null,
    };
  },
});

export const upsertForEvent = mutation({
  args: {
    eventId: v.id("events"),
    rating: reviewRatingValidator,
    body: v.string(),
  },
  returns: viewerReviewValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event || event.status !== "approved") {
      throw new ConvexError("Event not found");
    }

    const now = Date.now();
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userid_and_eventid", (q) =>
        q.eq("userId", user._id).eq("eventId", args.eventId),
      )
      .first();

    const body = args.body.trim();
    if (body.length === 0) {
      throw new ConvexError("Review body is required");
    }
    if (body.length > MAX_REVIEW_BODY_LENGTH) {
      throw new ConvexError("Review body is too long");
    }

    const reviewId = existingReview
      ? existingReview._id
      : await ctx.db.insert("reviews", {
          eventId: args.eventId,
          userId: user._id,
          rating: args.rating,
          body,
          createdAt: now,
          updatedAt: now,
        });

    if (existingReview) {
      await ctx.db.patch(existingReview._id, {
        rating: args.rating,
        body,
        updatedAt: now,
      });
    }

    const eventReviews = await ctx.db
      .query("reviews")
      .withIndex("by_eventid_and_createdat", (q) => q.eq("eventId", args.eventId))
      .collect();

    const ratingTotal = eventReviews.reduce((total, review) => total + review.rating, 0);
    await ctx.db.patch(args.eventId, {
      rating: roundAverageRating(ratingTotal, eventReviews.length),
    });

    return {
      id: reviewId,
      rating: args.rating,
      body,
    };
  },
});
