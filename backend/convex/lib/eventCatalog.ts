const PLACE_SOURCE_NAMES = new Set(["googleplaces", "foursquare"]);
const HOTEL_LIKE_TOKENS = [
  "hotel",
  "hotels",
  "resort",
  "resorts",
  "suite",
  "suites",
  "accommodation",
  "lodging",
  "aparthotel",
  "hostel",
  "inn",
  "villa",
  "villas",
];

type LegacyCatalogEventRecord = {
  externalSource: string | null;
  title: string;
  categories: string[];
  tags: string[];
  startAt: number | null;
  endAt: number | null;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function isPlaceSourceRecord(externalSource: string | null) {
  if (!externalSource) {
    return false;
  }

  return PLACE_SOURCE_NAMES.has(normalizeText(externalSource));
}

export function isHotelLikeText(text: string) {
  const normalizedText = normalizeText(text);

  if (normalizedText.length === 0) {
    return false;
  }

  return HOTEL_LIKE_TOKENS.some((token) => normalizedText.includes(token));
}

function hasHotelLikeMetadata(record: LegacyCatalogEventRecord) {
  if (isHotelLikeText(record.title)) {
    return true;
  }

  return [...record.categories, ...record.tags].some((value) => isHotelLikeText(value));
}

export function isLegacyCatalogEventInvalid(record: LegacyCatalogEventRecord) {
  if (isPlaceSourceRecord(record.externalSource)) {
    return true;
  }

  if (hasHotelLikeMetadata(record)) {
    return true;
  }

  return record.externalSource === "visitsaudi" && record.endAt === null;
}
