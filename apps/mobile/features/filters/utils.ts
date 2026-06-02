import type { CategoryDoc } from "@/hooks/use-categories";
import type { EventDoc } from "@/hooks/use-events";
import type { EventFilters, FilterType } from "@/features/events/data";
import { SUPPORTED_CITIES, getCityLabel } from "@/features/location/cities";

type TranslateFn = (key: string) => string;

type BuildFilterSummaryTagsArgs = {
  filters: EventFilters | null;
  t: TranslateFn;
  isArabic: boolean;
  categories: CategoryDoc[];
};

export type FilterOption = { id: string; label: string };

export type FilterSummaryTag = {
  id: string;
  label: string;
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  all: "All",
  sports: "Sports",
  adventure: "Adventure",
  entertainment: "Entertainment",
  food: "Food",
  concerts: "Concerts",
  arts: "Arts",
  tech: "Tech",
  wellness: "Wellness",
  music: "Music",
  family: "Family",
  nightlife: "Nightlife",
  culture: "Culture",
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  all: "الكل",
  sports: "رياضة",
  adventure: "مغامرة",
  entertainment: "ترفيه",
  food: "طعام",
  concerts: "حفلات",
  arts: "فنون",
  tech: "تقنية",
  wellness: "عافية",
  music: "موسيقى",
  family: "عائلة",
  nightlife: "سهر",
  culture: "ثقافة",
};

export const CALENDAR_THEME = {
  backgroundColor: "#FFFFFF",
  calendarBackground: "#FFFFFF",
  selectedDayBackgroundColor: "#000000",
  selectedDayTextColor: "#FFFFFF",
  todayTextColor: "#000000",
  dayTextColor: "#333333",
  textDisabledColor: "#D1D1D6",
  arrowColor: "#000000",
  monthTextColor: "#000000",
  textDayFontWeight: "400",
  textMonthFontWeight: "700",
  textDayHeaderFontWeight: "500",
  textDayFontSize: 16,
  textMonthFontSize: 17,
  textDayHeaderFontSize: 13,
};

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function formatCategoryKeyLabel(categoryKey: string): string {
  return categoryKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFallbackCategoryLabel(categoryKey: string, isArabic: boolean): string {
  const label = isArabic ? CATEGORY_LABELS_AR[categoryKey] : CATEGORY_LABELS_EN[categoryKey];
  return label ?? formatCategoryKeyLabel(categoryKey);
}

export function getCategoryLabelByIdMap(
  categories: CategoryDoc[],
  isArabic: boolean,
): Record<string, string> {
  const categoryLabelById: Record<string, string> = {};

  for (const categoryKey of Object.keys(isArabic ? CATEGORY_LABELS_AR : CATEGORY_LABELS_EN)) {
    categoryLabelById[categoryKey] = getFallbackCategoryLabel(categoryKey, isArabic);
  }

  for (const category of categories) {
    if (category.key === "all") {
      continue;
    }

    categoryLabelById[category.key] = isArabic ? category.labelAr : category.label;
  }

  return categoryLabelById;
}

export function getCategoryIdsForType(events: EventDoc[], type: FilterType): string[] {
  const filtered = type === "both" ? events : events.filter((e) => e.type === type);
  return uniqueSorted(filtered.flatMap((e) => e.categories));
}

export function getCityOptions(events: EventDoc[]): string[] {
  const eventCities = uniqueSorted(events.map((e) => e.city));
  return uniqueSorted([...SUPPORTED_CITIES, ...eventCities]);
}

export function getCityDisplayLabel(city: string, isArabic: boolean): string {
  return getCityLabel(city, isArabic);
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildMarkedDates(start?: string, end?: string): Record<string, object> {
  if (!start) return {};

  if (!end || end === start) {
    return {
      [start]: { startingDay: true, endingDay: true, color: "#000", textColor: "#FFF" },
    };
  }

  const marks: Record<string, object> = {};
  const current = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);

  while (current <= last) {
    const key = toLocalDateString(current);
    const isStart = key === start;
    const isEnd = key === end;

    marks[key] = {
      ...(isStart && { startingDay: true }),
      ...(isEnd && { endingDay: true }),
      color: isStart || isEnd ? "#000" : "#F0F0F0",
      textColor: isStart || isEnd ? "#FFF" : "#000",
    };

    current.setDate(current.getDate() + 1);
  }

  return marks;
}

export function formatRange(start?: string, end?: string, locale = "en-US"): string | null {
  if (!start) return null;

  const formatDate = (value: string) => {
    const date = new Date(`${value}T12:00:00`);
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} — ${formatDate(end)}`;
}

export function buildFilterSummaryTags({
  filters,
  t,
  isArabic,
  categories,
}: BuildFilterSummaryTagsArgs): FilterSummaryTag[] {
  if (!filters) return [];

  const tags: FilterSummaryTag[] = [];
  const categoryLabelById = getCategoryLabelByIdMap(categories, isArabic);

  if (filters.type === "event") tags.push({ id: "type:event", label: t("filters.typeEvent") });
  if (filters.type === "activity") {
    tags.push({ id: "type:activity", label: t("filters.typeActivity") });
  }
  if (filters.type === "both") {
    tags.push({ id: "type:both", label: t("filters.activitiesAndEvents") });
  }

  if (filters.cities.length > 0) {
    tags.push(
      ...filters.cities.map((city) => ({
        id: `city:${city}`,
        label: getCityDisplayLabel(city, isArabic),
      })),
    );
  } else {
    tags.push({ id: "city:all", label: t("filters.allCities") });
  }

  if (filters.categories.length > 0) {
    tags.push(
      ...filters.categories.map((categoryId) => ({
        id: `category:${categoryId}`,
        label: categoryLabelById[categoryId] ?? categoryId,
      })),
    );
  } else {
    tags.push({ id: "category:any", label: t("filters.anyCategory") });
  }

  if (filters.date === "today") tags.push({ id: "date:today", label: t("filters.dateToday") });
  if (filters.date === "thisWeekend") {
    tags.push({ id: "date:thisWeekend", label: t("filters.dateThisWeekend") });
  }
  if (filters.date === "next7Days") {
    tags.push({ id: "date:next7Days", label: t("filters.dateNext7Days") });
  }
  if (filters.date === "specificDates") {
    const dateRange = formatRange(filters.startDate, filters.endDate, isArabic ? "ar-SA" : "en-US");
    if (dateRange) tags.push({ id: "date:specificDates", label: dateRange });
  }

  if (filters.timing === "ongoing") {
    tags.push({ id: "timing:ongoing", label: t("filters.whenOngoing") });
  }
  if (filters.timing === "upcoming") {
    tags.push({ id: "timing:upcoming", label: t("filters.whenUpcoming") });
  }

  if (filters.activityMode === "indoor") {
    tags.push({ id: "mode:indoor", label: t("filters.modeIndoor") });
  }
  if (filters.activityMode === "outdoor") {
    tags.push({ id: "mode:outdoor", label: t("filters.modeOutdoor") });
  }
  if (filters.activityMode === "mixed") {
    tags.push({ id: "mode:mixed", label: t("filters.modeMixed") });
  }

  return tags;
}

export function removeFilterBySummaryTag(filters: EventFilters, tagId: string): EventFilters {
  const [kind, value = ""] = tagId.split(":");

  if (kind === "type") {
    return {
      ...filters,
      type: "both",
      timing: "all",
      activityMode: "all",
    };
  }

  if (kind === "city") {
    if (value === "all") {
      return filters;
    }

    return {
      ...filters,
      cities: filters.cities.filter((city) => city !== value),
    };
  }

  if (kind === "category") {
    if (value === "any") {
      return filters;
    }

    return {
      ...filters,
      categories: filters.categories.filter((category) => category !== value),
    };
  }

  if (kind === "date") {
    return {
      ...filters,
      date: "any",
      startDate: undefined,
      endDate: undefined,
    };
  }

  if (kind === "timing") {
    return {
      ...filters,
      timing: "all",
    };
  }

  if (kind === "mode") {
    return {
      ...filters,
      activityMode: "all",
    };
  }

  return filters;
}
