import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import type { EventData } from "./schema";

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

type FoursquarePlace = {
  fsq_id?: string;
  name?: string;
  categories?: Array<{ name?: string }>;
  location?: { formatted_address?: string };
  geocodes?: { main?: { latitude?: number; longitude?: number } };
  photos?: Array<{ prefix?: string; suffix?: string }>;
};

export const ingestKhobar = internalAction({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ ingested: number; ids: string[] }> => {
    const apiKey = process.env.FOURSQUARE_API_KEY;
    if (!apiKey) {
      throw new Error("FOURSQUARE_API_KEY is not set");
    }

    const query = args.query ?? "things to do";
    const limit = args.limit ?? 50;

    const url = new URL("https://api.foursquare.com/v3/places/search");
    url.searchParams.set("query", query);
    url.searchParams.set("near", "Khobar, Saudi Arabia");
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Foursquare API error: ${response.status} ${body}`);
    }

    const text = await response.text();
    const data = JSON.parse(text);
    const places: FoursquarePlace[] = Array.isArray(data?.results) ? data.results : [];

    const eventsData: EventData[] = [];

    for (const place of places) {
      const name = toNullableString(place.name);
      const title = name ?? "Untitled";

      const categories = (place.categories ?? []).map((c) => toNullableString(c.name)).filter((c) => c !== null);
      const categoryNames: string[] = [];
      for (const c of categories) {
        if (c) categoryNames.push(c);
      }

      const lat = place.geocodes?.main?.latitude;
      const lng = place.geocodes?.main?.longitude;

      if (!isNumber(lat) || !isNumber(lng)) {
        continue;
      }

      const images: string[] = [];
      for (const photo of place.photos ?? []) {
        const prefix = toNullableString(photo.prefix);
        const suffix = toNullableString(photo.suffix);
        if (prefix && suffix) {
          images.push(`${prefix}original${suffix}`);
        }
      }

      const externalId = toNullableString(place.fsq_id);

      eventsData.push({
        externalSource: "foursquare",
        externalId,
        title,
        titleAr: title,
        descriptionShort: null,
        descriptionShortAr: null,
        type: "activity",
        categories: categoryNames.length ? categoryNames : ["Places"],
        tags: [],
        startAt: null,
        endAt: null,
        city: "Khobar",
        locationLat: lat,
        locationLng: lng,
        locationAddress: toNullableString(place.location?.formatted_address),
        locationAddressAr: null,
        priceMin: null,
        priceMax: null,
        indoorOutdoor: "unknown",
        familyFriendly: null,
        images,
        favoritesCount: 0,
        status: "approved",
        rating: null,
      });
    }

    const ids: string[] = await ctx.runMutation(internal.ingest.ingestEvents, { eventsData });

    return { ingested: ids.length, ids };
  },
});
