import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { EventData } from "./schema";
import {
  buildGooglePlaceDescription,
  collectGooglePhotoReferences,
  getGooglePlaceCategories,
  type GooglePlaceDetails,
  type GoogleTextSearchPlace,
  isGoogleFoodPlace,
  toNullableNumber,
  toNullableString,
} from "./lib/googlePlaces";

const GOOGLE_PLACE_DETAILS_FIELDS = [
  "editorial_summary",
  "formatted_address",
  "geometry",
  "name",
  "photo",
  "place_id",
  "rating",
  "type",
].join(",");
const GOOGLE_PLACE_PHOTO_LIMIT = 3;
const GOOGLE_PLACE_PHOTO_WIDTH = "1600";
const GOOGLE_BACKFILL_SCAN_MINIMUM = 5000;

function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === "[object Number]";
}

function createGooglePlaceSeed(
  place: Pick<
    EventData,
    | "categories"
    | "city"
    | "externalId"
    | "favoritesCount"
    | "familyFriendly"
    | "images"
    | "indoorOutdoor"
    | "locationAddress"
    | "locationAddressAr"
    | "locationLat"
    | "locationLng"
    | "priceMax"
    | "priceMin"
    | "rating"
    | "startAt"
    | "endAt"
    | "status"
    | "tags"
    | "title"
    | "titleAr"
    | "type"
  >,
) {
  return {
    externalSource: "googleplaces",
    externalId: place.externalId,
    title: place.title,
    titleAr: place.titleAr,
    descriptionShort: null,
    descriptionShortAr: null,
    type: place.type,
    categories: place.categories,
    tags: place.tags,
    startAt: place.startAt,
    endAt: place.endAt,
    city: place.city,
    locationLat: place.locationLat,
    locationLng: place.locationLng,
    locationAddress: place.locationAddress,
    locationAddressAr: place.locationAddressAr,
    priceMin: place.priceMin,
    priceMax: place.priceMax,
    indoorOutdoor: place.indoorOutdoor,
    familyFriendly: place.familyFriendly,
    images: place.images,
    favoritesCount: place.favoritesCount,
    status: place.status,
    rating: place.rating,
  } satisfies EventData;
}

function createGooglePlaceSeedFromSearch(place: GoogleTextSearchPlace) {
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;

  if (!isNumber(lat) || !isNumber(lng)) {
    return null;
  }

  const title = toNullableString(place.name) ?? "Untitled";
  const tags = (place.types ?? []).filter((value) => toNullableString(value) !== null).slice(0, 10);

  return createGooglePlaceSeed({
    externalId: toNullableString(place.place_id),
    title,
    titleAr: title,
    categories: ["entertainment"],
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
    rating: toNullableNumber(place.rating),
    type: "activity",
  });
}

function mergeGooglePlaceDetails(
  seed: EventData,
  details: GooglePlaceDetails | null,
  images: string[],
  categories: string[],
  tags: string[],
) {
  const title = toNullableString(details?.name) ?? seed.title;
  const rating = toNullableNumber(details?.rating) ?? seed.rating;
  const descriptionShort = buildGooglePlaceDescription({
    title,
    city: seed.city,
    address: toNullableString(details?.formatted_address) ?? seed.locationAddress,
    rating,
    types: tags,
    editorialSummary: toNullableString(details?.editorial_summary?.overview),
  });

  const locationLat = toNullableNumber(details?.geometry?.location?.lat) ?? seed.locationLat;
  const locationLng = toNullableNumber(details?.geometry?.location?.lng) ?? seed.locationLng;

  return {
    ...seed,
    title,
    titleAr: title,
    descriptionShort,
    descriptionShortAr: descriptionShort,
    categories,
    tags,
    locationLat,
    locationLng,
    locationAddress: toNullableString(details?.formatted_address) ?? seed.locationAddress,
    images: images.length ? images : seed.images,
    rating,
  } satisfies EventData;
}

async function fetchGoogleTextSearchPlaces(apiKey: string, query: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", `${query} in Khobar Saudi Arabia`);
  url.searchParams.set("language", "en");
  url.searchParams.set("region", "sa");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places API error: ${response.status} ${body}`);
  }

  const data: { results?: GoogleTextSearchPlace[]; status?: string; error_message?: string } =
    JSON.parse(await response.text());

  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message ?? `Google Places API returned status "${data.status}"`);
  }

  return Array.isArray(data.results) ? data.results : [];
}

async function fetchGooglePlaceDetails(apiKey: string, placeId: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", GOOGLE_PLACE_DETAILS_FIELDS);
  url.searchParams.set("language", "en");
  url.searchParams.set("region", "sa");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Place Details API error: ${response.status} ${body}`);
  }

  const data: { result?: GooglePlaceDetails; status?: string; error_message?: string } = JSON.parse(
    await response.text(),
  );

  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      data.error_message ?? `Google Place Details API returned status "${data.status}"`,
    );
  }

  return data.result ?? null;
}

async function resolveGooglePhotoUrl(apiKey: string, photoReference: string) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/photo");
  url.searchParams.set("maxwidth", GOOGLE_PLACE_PHOTO_WIDTH);
  url.searchParams.set("photo_reference", photoReference);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { redirect: "manual" });
  const redirectedUrl = response.headers.get("location");

  if (redirectedUrl) {
    return redirectedUrl;
  }

  if (response.ok && response.url !== url.toString()) {
    return response.url;
  }

  return null;
}

async function resolveGooglePhotoUrls(
  apiKey: string,
  details: GooglePlaceDetails | null,
  summary: GoogleTextSearchPlace | null,
) {
  const photoReferences = [
    ...collectGooglePhotoReferences(details?.photos, GOOGLE_PLACE_PHOTO_LIMIT),
    ...collectGooglePhotoReferences(summary?.photos, GOOGLE_PLACE_PHOTO_LIMIT),
  ];
  const imageUrls: string[] = [];

  for (const photoReference of photoReferences) {
    if (imageUrls.length >= GOOGLE_PLACE_PHOTO_LIMIT) {
      break;
    }

    const imageUrl = await resolveGooglePhotoUrl(apiKey, photoReference);

    if (!imageUrl || imageUrls.includes(imageUrl)) {
      continue;
    }

    imageUrls.push(imageUrl);
  }

  return imageUrls;
}

function mergeGoogleTags(...tagSources: string[][]) {
  const mergedTags: string[] = [];

  for (const tagSource of tagSources) {
    for (const value of tagSource) {
      const normalizedValue = toNullableString(value);

      if (!normalizedValue || mergedTags.includes(normalizedValue)) {
        continue;
      }

      mergedTags.push(normalizedValue);
    }
  }

  return mergedTags.slice(0, 20);
}

async function enrichGooglePlaceSeed(
  apiKey: string,
  seed: EventData,
  summary: GoogleTextSearchPlace | null,
) {
  const placeId = seed.externalId;

  if (!placeId) {
    return seed;
  }

  try {
    const details = await fetchGooglePlaceDetails(apiKey, placeId);
    const title = toNullableString(details?.name) ?? seed.title;
    const tags = mergeGoogleTags(
      details?.types ?? [],
      summary?.types ?? [],
      seed.tags,
      seed.categories,
    );
    if (isGoogleFoodPlace({ title, types: tags })) {
      return null;
    }

    const categories = getGooglePlaceCategories({ title, types: tags });
    const images = await resolveGooglePhotoUrls(apiKey, details, summary);
    return mergeGooglePlaceDetails(seed, details, images, categories, tags);
  } catch (error) {
    console.warn(`Failed to enrich Google Place "${placeId}"`, error);
    const tags = mergeGoogleTags(summary?.types ?? [], seed.tags, seed.categories);
    if (isGoogleFoodPlace({ title: seed.title, types: tags })) {
      return null;
    }

    const categories = getGooglePlaceCategories({ title: seed.title, types: tags });
    return mergeGooglePlaceDetails(seed, null, seed.images, categories, tags);
  }
}

export const ingestKhobar = internalAction({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ ingested: number; ids: string[] }> => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is not set");
    }

    const query = args.query ?? "things to do";
    const limit = args.limit ?? 20;
    const places = await fetchGoogleTextSearchPlaces(apiKey, query);
    const eventsData: EventData[] = [];

    for (const place of places.slice(0, limit)) {
      const seed = createGooglePlaceSeedFromSearch(place);
      if (!seed) {
        continue;
      }

      const enrichedPlace = await enrichGooglePlaceSeed(apiKey, seed, place);
      if (!enrichedPlace) {
        continue;
      }

      eventsData.push(enrichedPlace);
    }

    const ids: string[] = await ctx.runMutation(internal.ingest.ingestEvents, { eventsData });

    return { ingested: ids.length, ids };
  },
});

export const listExistingGooglePlaces = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const scanLimit = Math.max(limit * 4, GOOGLE_BACKFILL_SCAN_MINIMUM);
    const events = await ctx.db.query("events").take(scanLimit);
    const existingGooglePlaces = [];

    for (const event of events) {
      if (event.externalSource !== "googleplaces" || !event.externalId) {
        continue;
      }

      existingGooglePlaces.push({
        eventId: event._id,
        eventData: createGooglePlaceSeed({
          externalId: event.externalId,
          title: event.title,
          titleAr: event.titleAr,
          categories: event.categories,
          tags: event.tags,
          startAt: event.startAt,
          endAt: event.endAt,
          city: event.city,
          locationLat: event.locationLat,
          locationLng: event.locationLng,
          locationAddress: event.locationAddress,
          locationAddressAr: event.locationAddressAr,
          priceMin: event.priceMin,
          priceMax: event.priceMax,
          indoorOutdoor: event.indoorOutdoor,
          familyFriendly: event.familyFriendly,
          images: event.images,
          favoritesCount: event.favoritesCount,
          status: event.status,
          rating: event.rating,
          type: event.type,
        }),
      });

      if (existingGooglePlaces.length >= limit) {
        break;
      }
    }

    return existingGooglePlaces;
  },
});

export const rejectExistingGooglePlaces = internalMutation({
  args: {
    eventIds: v.array(v.id("events")),
  },
  handler: async (ctx, args) => {
    for (const eventId of args.eventIds) {
      await ctx.db.patch(eventId, {
        status: "rejected",
      });
    }

    return { rejected: args.eventIds.length };
  },
});

export const backfillExisting = internalAction({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ ingested: number; rejected: number; ids: string[] }> => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY is not set");
    }

    const existingGooglePlaces = await ctx.runQuery(
      internal.googleplaces.listExistingGooglePlaces,
      {
        limit: args.limit,
      },
    );
    const eventsData: EventData[] = [];
    const rejectedEventIds = [];

    for (const place of existingGooglePlaces) {
      const enrichedPlace = await enrichGooglePlaceSeed(apiKey, place.eventData, null);
      if (!enrichedPlace) {
        rejectedEventIds.push(place.eventId);
        continue;
      }

      eventsData.push(enrichedPlace);
    }

    if (rejectedEventIds.length > 0) {
      await ctx.runMutation(internal.googleplaces.rejectExistingGooglePlaces, {
        eventIds: rejectedEventIds,
      });
    }

    const ids: string[] = await ctx.runMutation(internal.ingest.ingestEvents, { eventsData });

    return { ingested: ids.length, rejected: rejectedEventIds.length, ids };
  },
});
