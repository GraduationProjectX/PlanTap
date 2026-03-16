import type { CategoryDoc } from "@/hooks/use-categories";
import type { EventFilters } from "@/lib/event-filters";

type TranslateFn = (key: string) => string;

type BuildFilterSummaryTagsArgs = {
  filters: EventFilters | null;
  t: TranslateFn;
  isArabic: boolean;
  categories: CategoryDoc[];
};

export type FilterSummaryTag = {
  id: string;
  label: string;
};

function formatRange(start?: string, end?: string, locale = "en-US"): string | null {
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
  const categoryLabelById: Record<string, string> = {};
  for (const category of categories) {
    categoryLabelById[category.key] = isArabic ? category.labelAr : category.label;
  }

  if (filters.type === "event") tags.push({ id: "type:event", label: t("filters.typeEvent") });
  if (filters.type === "activity") {
    tags.push({ id: "type:activity", label: t("filters.typeActivity") });
  }
  if (filters.type === "both") {
    tags.push({ id: "type:both", label: t("filters.activitiesAndEvents") });
  }

  if (filters.cities.length > 0) {
    tags.push(...filters.cities.map((city) => ({ id: `city:${city}`, label: city })));
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
