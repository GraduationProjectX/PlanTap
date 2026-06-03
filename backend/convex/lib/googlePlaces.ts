function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === "[object Number]";
}

function toSingleLineText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

const GENERIC_GOOGLE_TYPES = new Set([
  "establishment",
  "food",
  "general_contractor",
  "geocode",
  "health",
  "point_of_interest",
  "premise",
  "route",
  "street_address",
]);
const GOOGLE_FOOD_TYPES = new Set([
  "bakery",
  "bar",
  "cafe",
  "coffee_shop",
  "deli",
  "dessert_restaurant",
  "fast_food_restaurant",
  "food_court",
  "food_store",
  "ice_cream_shop",
  "meal_delivery",
  "meal_takeaway",
  "restaurant",
  "tea_house",
]);
const GOOGLE_FOOD_TITLE_TOKENS = [
  "bakery",
  "bistro",
  "burger",
  "cafe",
  "café",
  "coffee",
  "dining",
  "grill",
  "kitchen",
  "pizza",
  "restaurant",
  "roastery",
  "shawarma",
  "tea",
];

type GooglePlaceCategoryArgs = {
  title: string;
  types: string[];
};

export type GooglePlacePhoto = {
  photo_reference?: string;
  html_attributions?: string[];
};

export type GoogleTextSearchPlace = {
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
  photos?: GooglePlacePhoto[];
};

export type GooglePlaceDetails = {
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
  editorial_summary?: {
    overview?: string;
  };
  photos?: GooglePlacePhoto[];
};

export function toNullableString(value: unknown): string | null {
  if (value === null) return null;
  if (value === undefined) return null;
  if (isString(value)) return value;
  return null;
}

export function toNullableNumber(value: unknown): number | null {
  if (value === null) return null;
  if (value === undefined) return null;
  if (isNumber(value)) return value;
  return null;
}

function humanizeGoogleType(rawType: string) {
  return rawType
    .split("_")
    .filter((segment) => segment.length > 0)
    .join(" ");
}

function normalizeGoogleToken(token: string) {
  return token.trim().toLowerCase();
}

function hasGoogleTokenMatch(tokens: string[], matchers: string[]) {
  const normalizedText = ` ${tokens.map((token) => normalizeGoogleToken(token)).join(" ")} `;

  return matchers.some((matcher) => normalizedText.includes(` ${matcher} `));
}

function createUniqueGoogleTokens(tokens: string[]) {
  const uniqueTokens = new Set<string>();

  for (const token of tokens) {
    const normalizedToken = normalizeGoogleToken(token);

    if (normalizedToken.length === 0) {
      continue;
    }

    uniqueTokens.add(normalizedToken);
  }

  return [...uniqueTokens];
}

export function getGooglePlaceDescriptor(types: string[]) {
  for (const type of types) {
    const normalizedType = normalizeGoogleToken(type);

    if (normalizedType.length === 0) {
      continue;
    }

    if (GENERIC_GOOGLE_TYPES.has(normalizedType)) {
      continue;
    }

    return humanizeGoogleType(normalizedType);
  }

  return null;
}

export function isGoogleFoodPlace(args: GooglePlaceCategoryArgs) {
  const normalizedTypes = createUniqueGoogleTokens(args.types);
  if (
    normalizedTypes.some(
      (type) => GOOGLE_FOOD_TYPES.has(type) || type === "hookah_bar" || type === "hookah lounge",
    )
  ) {
    return true;
  }

  if (
    args.title.includes("\u0645\u0642\u0647\u0649") ||
    args.title.includes("\u0643\u0627\u0641\u064A\u0647")
  ) {
    return true;
  }

  return hasGoogleTokenMatch([args.title], GOOGLE_FOOD_TITLE_TOKENS);
}

export function getGooglePlaceCategories(args: GooglePlaceCategoryArgs) {
  const normalizedTypes = createUniqueGoogleTokens(args.types);
  const categories = new Set<string>();
  const searchableTokens = [args.title, ...normalizedTypes];

  if (
    normalizedTypes.some((type) =>
      ["gym", "sports_activity_location", "sports_club", "stadium"].includes(type),
    ) ||
    hasGoogleTokenMatch(searchableTokens, ["gym", "padel", "sport", "stadium"])
  ) {
    categories.add("sports");
  }

  if (
    normalizedTypes.some((type) =>
      [
        "art_gallery",
        "cultural_center",
        "historical_landmark",
        "museum",
        "performing_arts_theater",
      ].includes(type),
    ) ||
    hasGoogleTokenMatch(searchableTokens, [
      "art",
      "culture",
      "cultural",
      "gallery",
      "heritage",
      "museum",
    ])
  ) {
    categories.add("arts");
  }

  if (
    normalizedTypes.some((type) =>
      ["park", "tourist_attraction", "zoo", "aquarium", "beach", "campground", "marina"].includes(
        type,
      ),
    ) ||
    hasGoogleTokenMatch(searchableTokens, [
      "aquarium",
      "beach",
      "corniche",
      "marina",
      "park",
      "waterfront",
      "zoo",
    ])
  ) {
    categories.add("adventure");
  }

  if (
    normalizedTypes.some((type) =>
      ["massage_spa", "spa", "beauty_salon", "hair_care", "yoga_studio"].includes(type),
    ) ||
    hasGoogleTokenMatch(searchableTokens, ["massage", "spa", "wellness", "yoga"])
  ) {
    categories.add("wellness");
  }

  if (
    normalizedTypes.some((type) =>
      ["concert_hall", "live_music_venue", "music_venue"].includes(type),
    ) ||
    hasGoogleTokenMatch(searchableTokens, ["concert", "live music", "music venue"])
  ) {
    categories.add("concerts");
  }

  if (
    normalizedTypes.some((type) => ["electronics_store"].includes(type)) ||
    hasGoogleTokenMatch(searchableTokens, ["innovation", "robotics", "tech"])
  ) {
    categories.add("tech");
  }

  if (
    normalizedTypes.some((type) =>
      [
        "amusement_center",
        "amusement_park",
        "bowling_alley",
        "movie_theater",
        "night_club",
        "shopping_mall",
      ].includes(type),
    ) ||
    hasGoogleTokenMatch(searchableTokens, ["arcade", "cinema", "mall", "shopping"])
  ) {
    categories.add("entertainment");
  }

  if (categories.size === 0) {
    categories.add("entertainment");
  }

  return [...categories];
}

export function buildGooglePlaceDescription(args: {
  title: string;
  city: string;
  address: string | null;
  rating: number | null;
  types: string[];
  editorialSummary: string | null;
}) {
  const editorialSummary = args.editorialSummary ? toSingleLineText(args.editorialSummary) : null;

  if (editorialSummary) {
    return editorialSummary;
  }

  const sentences: string[] = [];
  const descriptor = getGooglePlaceDescriptor(args.types);

  if (descriptor) {
    sentences.push(`${args.title} is a ${descriptor} in ${args.city}.`);
  } else {
    sentences.push(`${args.title} is a place to visit in ${args.city}.`);
  }

  if (args.rating !== null) {
    sentences.push(`It is rated ${args.rating.toFixed(1)}/5 on Google.`);
  }

  if (args.address) {
    sentences.push(`Located at ${toSingleLineText(args.address)}.`);
  }

  return sentences.join(" ");
}

export function collectGooglePhotoReferences(
  photos: GooglePlacePhoto[] | undefined,
  limit: number,
) {
  const references: string[] = [];

  for (const photo of photos ?? []) {
    const photoReference = toNullableString(photo.photo_reference);

    if (!photoReference) {
      continue;
    }

    if (references.includes(photoReference)) {
      continue;
    }

    references.push(photoReference);

    if (references.length >= limit) {
      break;
    }
  }

  return references;
}
