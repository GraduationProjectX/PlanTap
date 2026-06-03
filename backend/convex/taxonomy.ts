import { internalMutation, type MutationCtx } from "./_generated/server";
import {
  CANONICAL_CATEGORY_DEFINITIONS,
  normalizeEventCategories,
  normalizeEventCity,
} from "./lib/eventTaxonomy";

const LOOKUP_LIMIT = 5000;

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

async function backfillCanonicalCategoriesInDb(ctx: MutationCtx) {
  const existingCategories = await ctx.db.query("categories").take(LOOKUP_LIMIT);
  const existingCategoriesByKey = new Map(
    existingCategories.map((category) => [category.key, category]),
  );
  let inserted = 0;
  let updated = 0;

  for (const category of CANONICAL_CATEGORY_DEFINITIONS) {
    const existing = existingCategoriesByKey.get(category.key);

    if (!existing) {
      await ctx.db.insert("categories", category);
      inserted += 1;
      continue;
    }

    if (
      existing.label !== category.label ||
      existing.labelAr !== category.labelAr ||
      existing.icon !== category.icon ||
      existing.sortOrder !== category.sortOrder
    ) {
      await ctx.db.patch(existing._id, category);
      updated += 1;
    }
  }

  return {
    inserted,
    updated,
    totalCanonicalCategories: CANONICAL_CATEGORY_DEFINITIONS.length,
  };
}

async function normalizeEventsInDb(ctx: MutationCtx) {
  const events = await ctx.db.query("events").take(LOOKUP_LIMIT);
  const unresolvedCities = new Set<string>();
  let scanned = 0;
  let patched = 0;
  let skipped = 0;

  for (const event of events) {
    scanned += 1;

    const normalizedCity = normalizeEventCity(event.city);
    if (!normalizedCity) {
      skipped += 1;
      unresolvedCities.add(event.city);
      console.warn(`Skipping existing event with unsupported city "${event.city}"`, {
        eventId: event._id,
        title: event.title,
        externalSource: event.externalSource,
        externalId: event.externalId,
      });
      continue;
    }

    const normalizedCategories = normalizeEventCategories(event.categories);
    const shouldPatch =
      normalizedCity !== event.city || !arraysEqual(normalizedCategories, event.categories);

    if (!shouldPatch) {
      continue;
    }

    await ctx.db.patch(event._id, {
      city: normalizedCity,
      categories: normalizedCategories,
    });
    patched += 1;
  }

  return {
    scanned,
    patched,
    skipped,
    unresolvedCities: [...unresolvedCities],
  };
}

export const backfillCanonicalCategories = internalMutation({
  args: {},
  handler: async (ctx) => await backfillCanonicalCategoriesInDb(ctx),
});

export const normalizeEvents = internalMutation({
  args: {},
  handler: async (ctx) => await normalizeEventsInDb(ctx),
});

export const normalizeAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const categories = await backfillCanonicalCategoriesInDb(ctx);
    const events = await normalizeEventsInDb(ctx);

    return {
      categories,
      events,
    };
  },
});
