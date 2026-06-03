export const SUPPORTED_EVENT_CITIES = [
  "Riyadh",
  "Jeddah",
  "Makkah",
  "Madinah",
  "Dammam",
  "Khobar",
  "Qassim",
  "Taif",
  "Abha",
  "Tabuk",
  "Hail",
  "Jazan",
  "Najran",
  "Al Ahsa",
  "Al Jubail",
  "Yanbu",
];

export const CANONICAL_CATEGORY_DEFINITIONS = [
  { key: "all", label: "All", labelAr: "الكل", icon: "grid", sortOrder: 0 },
  { key: "sports", label: "Sports", labelAr: "رياضة", icon: "sports", sortOrder: 9 },
  { key: "adventure", label: "Adventure", labelAr: "مغامرة", icon: "adventure", sortOrder: 2 },
  {
    key: "entertainment",
    label: "Entertainment",
    labelAr: "ترفيه",
    icon: "entertainment",
    sortOrder: 3,
  },
  { key: "food", label: "Food", labelAr: "طعام", icon: "food", sortOrder: 4 },
  { key: "concerts", label: "Concerts", labelAr: "حفلات", icon: "music", sortOrder: 5 },
  { key: "arts", label: "Arts", labelAr: "فنون", icon: "arts", sortOrder: 6 },
  { key: "tech", label: "Tech", labelAr: "تقنية", icon: "tech", sortOrder: 7 },
  { key: "wellness", label: "Wellness", labelAr: "صحة", icon: "wellness", sortOrder: 8 },
];

const DEFAULT_CATEGORY_KEY = "entertainment";

function normalizeCategoryToken(token: string) {
  const normalized = token.trim().toLowerCase();

  if (normalized.length === 0) {
    return DEFAULT_CATEGORY_KEY;
  }

  switch (normalized) {
    case "sports":
      return "sports";
    case "adventure":
      return "adventure";
    case "attractions":
      return "adventure";
    case "beach & seaside":
      return "adventure";
    case "entertainment":
      return "entertainment";
    case "festivals & events":
      return "entertainment";
    case "nightlife & lounges":
      return "entertainment";
    case "shopping":
      return "entertainment";
    case "food":
      return "food";
    case "food & dining":
      return "food";
    case "concerts":
      return "concerts";
    case "arts":
      return "arts";
    case "culture & history":
      return "arts";
    case "tech":
      return "tech";
    case "wellness":
      return "wellness";
    case "wellness & spa":
      return "wellness";
    default:
      return DEFAULT_CATEGORY_KEY;
  }
}

export function normalizeEventCity(city: string) {
  const normalized = city.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (normalized === "The Red Sea") {
    return "Jeddah";
  }

  return SUPPORTED_EVENT_CITIES.includes(normalized) ? normalized : null;
}

export function normalizeEventCategories(categories: string[]) {
  const normalizedCategories = new Set<string>();

  for (const category of categories) {
    normalizedCategories.add(normalizeCategoryToken(category));
  }

  if (normalizedCategories.size === 0) {
    normalizedCategories.add(DEFAULT_CATEGORY_KEY);
  }

  return [...normalizedCategories];
}
