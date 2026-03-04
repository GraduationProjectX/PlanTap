import {
  ACTIVITY_EVENTS,
  MOCK_EVENTS,
  ONGOING_EVENTS,
  UPCOMING_EVENTS,
} from "@/data/mock-events";
import { adaptConvexEvents, type ConvexEventSource } from "@/lib/events/event-adapters";
import type { EventRecord } from "@/lib/events/event-contracts";
import type { EventListType } from "@/lib/event-list-type";

export type EventCollections = {
  all: EventRecord[];
  ongoing: EventRecord[];
  upcoming: EventRecord[];
  activity: EventRecord[];
};

export const MOCK_EVENT_COLLECTIONS: EventCollections = {
  all: MOCK_EVENTS,
  ongoing: ONGOING_EVENTS,
  upcoming: UPCOMING_EVENTS,
  activity: ACTIVITY_EVENTS,
};

export function buildEventCollectionsFromConvex(events: ConvexEventSource[]): EventCollections {
  const normalized = adaptConvexEvents(events);
  const now = Date.now();

  const ongoing = normalized.filter(
    (event) =>
      event.type === "event" &&
      event.startAt != null &&
      event.endAt != null &&
      event.startAt <= now &&
      event.endAt > now,
  );

  const upcoming = normalized
    .filter((event) => event.type === "event" && event.startAt != null && event.startAt > now)
    .sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));

  const activity = normalized
    .filter((event) => event.type === "activity")
    .sort((a, b) => {
      const ratingDelta = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDelta !== 0) return ratingDelta;
      return (a.startAt ?? Number.MAX_SAFE_INTEGER) - (b.startAt ?? Number.MAX_SAFE_INTEGER);
    });

  return {
    all: normalized,
    ongoing,
    upcoming,
    activity,
  };
}

export function getEventsForListType(collections: EventCollections, type: EventListType): EventRecord[] {
  if (type === "ongoing") return collections.ongoing;
  if (type === "upcoming") return collections.upcoming;
  if (type === "activity") return collections.activity;
  return collections.all;
}
