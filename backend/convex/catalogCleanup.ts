import { internalMutation } from "./_generated/server";
import { isLegacyCatalogEventInvalid } from "./lib/eventCatalog";

const LOOKUP_LIMIT = 5000;

export const deleteLegacyCatalogEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").take(LOOKUP_LIMIT);
    const eventsToDelete = events.filter((event) => isLegacyCatalogEventInvalid(event));
    const eventIds = new Set(eventsToDelete.map((event) => event._id));

    if (eventIds.size === 0) {
      return {
        scannedEvents: events.length,
        deletedEvents: 0,
        deletedBookmarks: 0,
        deletedReviews: 0,
      };
    }

    const bookmarks = await ctx.db.query("bookmarks").take(LOOKUP_LIMIT);
    let deletedBookmarks = 0;
    for (const bookmark of bookmarks) {
      if (!eventIds.has(bookmark.eventId)) {
        continue;
      }

      await ctx.db.delete(bookmark._id);
      deletedBookmarks += 1;
    }

    const reviews = await ctx.db.query("reviews").take(LOOKUP_LIMIT);
    let deletedReviews = 0;
    for (const review of reviews) {
      if (!eventIds.has(review.eventId)) {
        continue;
      }

      await ctx.db.delete(review._id);
      deletedReviews += 1;
    }

    for (const event of eventsToDelete) {
      await ctx.db.delete(event._id);
    }

    return {
      scannedEvents: events.length,
      deletedEvents: eventsToDelete.length,
      deletedBookmarks,
      deletedReviews,
    };
  },
});
