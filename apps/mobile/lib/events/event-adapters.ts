import type {
  EventIndoorOutdoorMode,
  EventRecord,
  EventStatus,
  EventType,
} from "@/lib/events/event-contracts";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600";

export type MockEventSource = {
  id: string;
  title: string;
  titleAr: string;
  descriptionShort?: string;
  descriptionShortAr?: string;
  type: EventType;
  categories: string[];
  tags: string[];
  startAt?: number;
  endAt?: number;
  city: string;
  location: { lat: number; lng: number; address?: string; addressAr?: string };
  priceMin?: number;
  priceMax?: number;
  indoorOutdoor: EventIndoorOutdoorMode;
  familyFriendly?: boolean;
  images: string[];
  favoritesCount: number;
  status: EventStatus;
  rating?: number;
};

export type ConvexEventSource = {
  _id: string;
  title?: string | null;
  titleAr?: string | null;
  descriptionShort?: string | null;
  descriptionShortAr?: string | null;
  type?: EventType | null;
  categories?: string[] | null;
  tags?: string[] | null;
  startAt?: number | null;
  endAt?: number | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationAddress?: string | null;
  locationAddressAr?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  indoorOutdoor?: EventIndoorOutdoorMode | null;
  familyFriendly?: boolean | null;
  images?: string[] | null;
  favoritesCount?: number | null;
  status?: EventStatus | null;
  rating?: number | null;
};

function normalizeImageList(images: string[] | null | undefined): string[] {
  const values = (images ?? []).map((value) => value.trim()).filter(Boolean);
  return values.length > 0 ? values : [DEFAULT_IMAGE];
}

function normalizeIndoorOutdoor(value: string | null | undefined): EventIndoorOutdoorMode {
  if (value === "indoor" || value === "outdoor" || value === "mixed" || value === "unknown") {
    return value;
  }

  return "unknown";
}

function normalizeType(value: string | null | undefined): EventType {
  return value === "activity" ? "activity" : "event";
}

function normalizeStatus(value: string | null | undefined): EventStatus {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }

  return "pending";
}

function normalizeNumberish(value: number | null | undefined): number | undefined {
  return typeof value === "number" ? value : undefined;
}

export function adaptMockEvent(source: MockEventSource): EventRecord {
  return {
    ...source,
    categories: [...source.categories],
    tags: [...source.tags],
    images: normalizeImageList(source.images),
    location: {
      lat: source.location.lat,
      lng: source.location.lng,
      address: source.location.address,
      addressAr: source.location.addressAr,
    },
  };
}

export function adaptConvexEvent(source: ConvexEventSource): EventRecord {
  return {
    id: source._id,
    title: source.title?.trim() || "Untitled event",
    titleAr: source.titleAr?.trim() || source.title?.trim() || "",
    descriptionShort: source.descriptionShort ?? undefined,
    descriptionShortAr: source.descriptionShortAr ?? undefined,
    type: normalizeType(source.type),
    categories: source.categories?.filter(Boolean) ?? [],
    tags: source.tags?.filter(Boolean) ?? [],
    startAt: normalizeNumberish(source.startAt),
    endAt: normalizeNumberish(source.endAt),
    city: source.city?.trim() || "Unknown city",
    location: {
      lat: typeof source.locationLat === "number" ? source.locationLat : 0,
      lng: typeof source.locationLng === "number" ? source.locationLng : 0,
      address: source.locationAddress ?? undefined,
      addressAr: source.locationAddressAr ?? undefined,
    },
    priceMin: normalizeNumberish(source.priceMin),
    priceMax: normalizeNumberish(source.priceMax),
    indoorOutdoor: normalizeIndoorOutdoor(source.indoorOutdoor),
    familyFriendly: source.familyFriendly ?? undefined,
    images: normalizeImageList(source.images),
    favoritesCount: typeof source.favoritesCount === "number" ? source.favoritesCount : 0,
    status: normalizeStatus(source.status),
    rating: normalizeNumberish(source.rating),
  };
}

export function adaptConvexEvents(events: ConvexEventSource[]): EventRecord[] {
  return events.map(adaptConvexEvent);
}
