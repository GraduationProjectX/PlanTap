import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Doc } from "backend/convex/_generated/dataModel";

import { readCachedData, writeCachedData } from "@/utils/data-cache";
import { STORAGE_KEYS } from "@/storage/keys";

export type EventDoc = Doc<"events">;

export type EventCollections = {
  all: EventDoc[];
  ongoing: EventDoc[];
  upcoming: EventDoc[];
  activity: EventDoc[];
};

const EVENTS_CACHE_TTL_MS = 10 * 60 * 1000;

function buildCollections(events: EventDoc[]): EventCollections {
  const now = Date.now();

  const ongoing = events.filter(
    (e) =>
      e.type === "event" &&
      e.startAt != null &&
      e.endAt != null &&
      e.startAt <= now &&
      e.endAt > now,
  );

  const upcoming = events
    .filter((e) => e.type === "event" && e.startAt != null && e.startAt > now)
    .sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));

  const activity = events
    .filter((e) => e.type === "activity")
    .sort((a, b) => {
      const ratingDelta = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDelta !== 0) return ratingDelta;
      return (a.startAt ?? Number.MAX_SAFE_INTEGER) - (b.startAt ?? Number.MAX_SAFE_INTEGER);
    });

  return { all: events, ongoing, upcoming, activity };
}

export function useEvents(city?: string, enabled = true) {
  const cacheKey = city ? `${STORAGE_KEYS.EVENTS_CACHE}:${city}` : STORAGE_KEYS.EVENTS_CACHE;
  const cacheKeyRef = useRef<string | null>(null);
  const cachedEventsRef = useRef<EventDoc[] | null>(null);

  if (cacheKeyRef.current !== cacheKey) {
    cacheKeyRef.current = cacheKey;
    cachedEventsRef.current = readCachedData<EventDoc[]>(cacheKey, EVENTS_CACHE_TTL_MS);
  }

  const liveEvents = useQuery(api.events.list, enabled ? (city ? { city } : {}) : "skip");

  useEffect(() => {
    if (liveEvents === undefined) {
      return;
    }

    writeCachedData(cacheKey, liveEvents);
    if (cacheKeyRef.current === cacheKey) {
      cachedEventsRef.current = liveEvents;
    }
  }, [liveEvents, cacheKey]);

  const events = liveEvents ?? cachedEventsRef.current ?? undefined;
  const isLoading = events === undefined;
  const isRefreshing = liveEvents === undefined && cachedEventsRef.current != null;
  const collections = events ? buildCollections(events) : null;

  return { events, collections, isLoading, isRefreshing };
}
