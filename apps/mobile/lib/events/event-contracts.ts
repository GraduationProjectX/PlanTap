export type EventType = "event" | "activity";

export type EventStatus = "pending" | "approved" | "rejected";

export type EventIndoorOutdoorMode = "indoor" | "outdoor" | "mixed" | "unknown";

export type EventLocation = {
  lat: number;
  lng: number;
  address?: string;
  addressAr?: string;
};

export type EventRecord = {
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
  location: EventLocation;
  priceMin?: number;
  priceMax?: number;
  indoorOutdoor: EventIndoorOutdoorMode;
  familyFriendly?: boolean;
  images: string[];
  favoritesCount: number;
  status: EventStatus;
  rating?: number;
};
