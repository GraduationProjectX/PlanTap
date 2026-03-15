import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserByClerkId, requireCurrentUser } from "./lib/auth";
import { eventFields } from "./schema";

const eventDocumentFields = {
  _id: v.id("events"),
  _creationTime: v.number(),
  ...eventFields,
};

const bookmarkedEventValidator = v.object({
  ...eventDocumentFields,
  bookmarkId: v.id("bookmarks"),
  bookmarkedAt: v.number(),
});

const toggleBookmarkResultValidator = v.object({
  bookmarked: v.boolean(),
});

const MAX_BOOKMARKS = 500;

export const listForUser = query({
  args: {},
  returns: v.array(bookmarkedEventValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userid_and_createdat", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_BOOKMARKS);

    const bookmarkedEvents = [];
    for (const bookmark of bookmarks) {
      const event = await ctx.db.get(bookmark.eventId);
      if (event) {
        bookmarkedEvents.push({
          ...event,
          bookmarkId: bookmark._id,
          bookmarkedAt: bookmark.createdAt,
        });
      }
    }

    return bookmarkedEvents;
  },
});

export const toggle = mutation({
  args: { eventId: v.id("events") },
  returns: toggleBookmarkResultValidator,
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_userid_and_eventid", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    const event = await ctx.db.get(args.eventId);
    if (!event || event.status !== "approved") {
      throw new ConvexError("Event not found");
    }

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.eventId, {
        favoritesCount: Math.max(0, event.favoritesCount - 1),
      });
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: user._id,
      eventId: args.eventId,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.eventId, {
      favoritesCount: event.favoritesCount + 1,
    });
    return { bookmarked: true };
  },
});

export const isBookmarked = query({
  args: { eventId: v.id("events") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const user = await getUserByClerkId(ctx, identity.subject);
    if (!user) {
      throw new ConvexError("User not found");
    }

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_userid_and_eventid", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    return bookmark !== null;
  },
});
