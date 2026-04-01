import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";

export const toggle = mutation({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const eventId = args.eventId;

        const existingFavorite = await ctx.db
            .query("favorites")
            .withIndex("by_userid_and_eventId", (q) =>
                q.eq("userId", user._id).eq("eventId", eventId)
            )
            .unique();

        const event = await ctx.db.get(eventId);
        if (!event) {
            throw new Error("Event not found");
        }

        if (existingFavorite) {
            // Unfavorite
            await ctx.db.delete(existingFavorite._id);
            const favoritesCount = event.favoritesCount > 0 ? event.favoritesCount - 1 : 0;
            await ctx.db.patch(eventId, { favoritesCount });
            return false; // isFavorite
        } else {
            // Favorite
            await ctx.db.insert("favorites", { userId: user._id, eventId });
            const favoritesCount = event.favoritesCount + 1;
            await ctx.db.patch(eventId, { favoritesCount });
            return true; // isFavorite
        }
    },
});

export const listMyFavorites = query({
    handler: async (ctx) => {
        const user = await getUser(ctx);
        const favorites = await ctx.db
            .query("favorites")
            .withIndex("by_userid_and_eventId", (q) => q.eq("userId", user._id))
            .collect();
        
        const eventIds = favorites.map((fav) => fav.eventId);

        const events = await Promise.all(
            eventIds.map((eventId) => ctx.db.get(eventId))
        );

        // Filter out any null events if an event was deleted but favorite wasn't
        return events.filter(Boolean);
    },
});

export const isFavorite = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const favorite = await ctx.db
            .query("favorites")
            .withIndex("by_userid_and_eventId", (q) =>
                q.eq("userId", user._id).eq("eventId", args.eventId)
            )
            .unique();
        return !!favorite;
    },
});
