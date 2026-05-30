import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === "[object Number]";
}

function toNullableString(value: unknown): string | null {
  if (value === null) return null;
  if (value === undefined) return null;
  if (isString(value)) return value;
  return null;
}

type GoogleTextSearchPlace = {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  types?: string[];
  rating?: number;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
};

export const ingestKhobar = internalAction({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is not set");
    }

    const query = args.query ?? "things to do";
    const limit = args.limit ?? 20;

    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", `${query} in Khobar Saudi Arabia`);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google Places API error: ${response.status} ${body}`);
    }

    const text = await response.text();
    const data = JSON.parse(text);
    const places: GoogleTextSearchPlace[] = Array.isArray(data?.results) ? data.results : [];

    const ids: string[] = [];

    for (const place of places.slice(0, limit)) {
      const lat = place.geometry?.location?.lat;
      const lng = place.geometry?.location?.lng;

      if (!isNumber(lat) || !isNumber(lng)) {
        continue;
      }

      const title = toNullableString(place.name) ?? "Untitled";
      const externalId = toNullableString(place.place_id);

      const typesRaw = place.types ?? [];
      const tags = typesRaw.filter((t) => isString(t)).slice(0, 10);

      const rating = place.rating;

      const id = await ctx.runMutation(internal.ingest.ingestEvent, {
        eventData: {
          externalSource: "googleplaces",
          externalId,
          title,
          titleAr: title,
          descriptionShort: null,
          descriptionShortAr: null,
          type: "activity",
          categories: ["Places"],
          tags,
          startAt: null,
          endAt: null,
          city: "Khobar",
          locationLat: lat,
          locationLng: lng,
          locationAddress: toNullableString(place.formatted_address),
          locationAddressAr: null,
          priceMin: null,
          priceMax: null,
          indoorOutdoor: "unknown",
          familyFriendly: null,
          images: [],
          favoritesCount: 0,
          status: "approved",
          rating: isNumber(rating) ? rating : null,
        },
      });

      ids.push(id);
    }

    return { ingested: ids.length, ids };
  },
});
