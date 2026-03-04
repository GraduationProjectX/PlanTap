import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getAuthenticatedUser(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");

  return user;
}

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) return [];

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const events = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const event = await ctx.db.get(bookmark.eventId);
        return event ? { ...event, bookmarkId: bookmark._id, bookmarkedAt: bookmark.createdAt } : null;
      }),
    );

    return events.filter((e) => e !== null);
  },
});

export const toggle = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_event", (q) => q.eq("userId", user._id).eq("eventId", args.eventId))
      .unique();

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    if (!user) return false;

    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_event", (q) => q.eq("userId", user._id).eq("eventId", args.eventId))
      .unique();

    return bookmark !== null;
  },
});
