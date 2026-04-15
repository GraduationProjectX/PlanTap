import type { CategoryDoc } from "@/hooks/use-categories";
import type { EventDoc } from "@/hooks/use-events";
import { getDistanceKm, type UserCoordinates } from "@/services/location";

const SHORT_TITLE_LIMIT = 24;

export function hasCoordinates(event: EventDoc): boolean {
  return Number.isFinite(event.locationLat) && Number.isFinite(event.locationLng);
}

export function getSortedEvents(events: EventDoc[], userCoordinates?: UserCoordinates): EventDoc[] {
  return [...events].sort((left, right) => {
    if (userCoordinates) {
      const leftDistance = getDistanceKm(userCoordinates, {
        latitude: left.locationLat,
        longitude: left.locationLng,
      });
      const rightDistance = getDistanceKm(userCoordinates, {
        latitude: right.locationLat,
        longitude: right.locationLng,
      });

      if (leftDistance !== rightDistance) {
        return leftDistance - rightDistance;
      }
    }

    const leftStart = left.startAt ?? Number.MAX_SAFE_INTEGER;
    const rightStart = right.startAt ?? Number.MAX_SAFE_INTEGER;
    if (leftStart !== rightStart) {
      return leftStart - rightStart;
    }

    return left.title.localeCompare(right.title);
  });
}

export function getBottomCameraPadding(insetsBottom: number): number {
  return insetsBottom + 272;
}

export function getCategoryOptions(categories: CategoryDoc[], isArabic: boolean) {
  return categories.map((category) => ({
    id: category.key,
    label: isArabic ? category.labelAr : category.label,
  }));
}

function matchesSearch(event: EventDoc, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  const fields = [
    event.title,
    event.titleAr,
    event.descriptionShort,
    event.descriptionShortAr,
    event.city,
    ...event.categories,
    ...event.tags,
  ].filter((field): field is string => field != null && field.length > 0);

  return fields.some((field) => field.toLowerCase().includes(query));
}

export function getVisibleEvents(
  events: EventDoc[],
  selectedCategory: string,
  query: string,
  userCoordinates?: UserCoordinates,
): EventDoc[] {
  const filteredEvents = events.filter((event) => {
    if (!hasCoordinates(event)) {
      return false;
    }

    if (selectedCategory !== "all" && !event.categories.includes(selectedCategory)) {
      return false;
    }

    return matchesSearch(event, query);
  });

  return getSortedEvents(filteredEvents, userCoordinates);
}

function getEventTitle(event: EventDoc, isArabic: boolean): string {
  const title = isArabic ? (event.titleAr ?? event.title) : event.title;
  return title.trim();
}

export function getMarkerThumbnailName(eventId: EventDoc["_id"]): string {
  return `event-image-${eventId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

function getFallbackThumbnailName(event: EventDoc): string {
  return event.type === "activity" ? "activity-fallback-thumbnail" : "event-fallback-thumbnail";
}

function getShortMarkerTitle(title: string): string {
  if (title.length <= SHORT_TITLE_LIMIT) {
    return title;
  }

  return `${title.slice(0, SHORT_TITLE_LIMIT - 3).trimEnd()}...`;
}

export function getMarkerFeatures(
  events: EventDoc[],
  isArabic: boolean,
  eventTypeLabel: string,
  activityTypeLabel: string,
  failedMarkerImages: Record<string, true>,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

  for (const event of events) {
    const title = getEventTitle(event, isArabic);
    const typeLabel = event.type === "activity" ? activityTypeLabel : eventTypeLabel;
    const fallbackThumbnail = getFallbackThumbnailName(event);

    features.push({
      type: "Feature",
      id: event._id,
      properties: {
        eventId: event._id,
        markerThumbnail:
          event.images[0] && !failedMarkerImages[event._id]
            ? getMarkerThumbnailName(event._id)
            : fallbackThumbnail,
        markerLabel: `${getShortMarkerTitle(title)}\n${typeLabel}`,
      },
      geometry: {
        type: "Point",
        coordinates: [event.locationLng, event.locationLat],
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}
