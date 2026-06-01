import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { isLegacyCatalogEventInvalid } from "./lib/eventCatalog";
import { normalizeEventCategories, normalizeEventCity } from "./lib/eventTaxonomy";
import { eventDataValidator, eventFields, type EventData } from "./schema";

function normalizeEventData(eventData: EventData) {
  const city = normalizeEventCity(eventData.city);

  if (!city) {
    console.warn(`Skipping event with unsupported city "${eventData.city}"`, {
      externalSource: eventData.externalSource,
      externalId: eventData.externalId,
      title: eventData.title,
    });
    return null;
  }

  if (isLegacyCatalogEventInvalid(eventData)) {
    console.warn(`Skipping invalid catalog record "${eventData.title}"`, {
      externalSource: eventData.externalSource,
      externalId: eventData.externalId,
    });
    return null;
  }

  return {
    ...eventData,
    city,
    categories: normalizeEventCategories(eventData.categories),
  };
}

export const ingestEvent = internalMutation({
  args: {
    eventData: v.object({
      ...eventFields,
    }),
  },
  handler: async (ctx, args) => {
    const eventData = normalizeEventData(args.eventData);

    if (!eventData) {
      return null;
    }

    const externalSource = eventData.externalSource;
    const externalId = eventData.externalId;

    if (externalSource && externalId) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_external", (q) =>
          q.eq("externalSource", externalSource).eq("externalId", externalId),
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, eventData);
        return existing._id;
      }
    }

    const id = await ctx.db.insert("events", {
      ...eventData,
      externalSource: externalSource ?? null,
      externalId: externalId ?? null,
    });

    return id;
  },
});

export const ingestEvents = internalMutation({
  args: {
    eventsData: v.array(eventDataValidator),
  },
  handler: async (ctx, args) => {
    const ids = [];

    for (const rawEventData of args.eventsData) {
      const eventData = normalizeEventData(rawEventData);

      if (!eventData) {
        continue;
      }

      const externalSource = eventData.externalSource;
      const externalId = eventData.externalId;

      if (externalSource && externalId) {
        const existing = await ctx.db
          .query("events")
          .withIndex("by_external", (q) =>
            q.eq("externalSource", externalSource).eq("externalId", externalId),
          )
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, eventData);
          ids.push(existing._id);
          continue;
        }
      }

      ids.push(
        await ctx.db.insert("events", {
          ...eventData,
          externalSource: externalSource ?? null,
          externalId: externalId ?? null,
        }),
      );
    }

    return ids;
  },
});
