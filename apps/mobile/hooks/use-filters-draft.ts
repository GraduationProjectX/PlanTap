import { useState } from "react";

import type { EventDoc } from "@/hooks/use-events";
import type { CategoryDoc } from "@/hooks/use-categories";
import {
  getCategoryIdsForType,
  getCategoryLabelByIdMap,
  getCityOptions,
  toggleValue,
  type FilterOption,
} from "@/features/filters/utils";
import {
  DEFAULT_EVENT_FILTERS,
  type EventFilters,
  type FilterDate,
  type FilterType,
} from "@/features/events/data";

type UseFiltersDraftArgs = {
  initialFilters: EventFilters | null;
  isArabic: boolean;
  events: EventDoc[];
  categories: CategoryDoc[];
};

type UseFiltersDraftResult = {
  draft: EventFilters;
  categoryOptions: FilterOption[];
  cityOptions: string[];
  selectType: (type: FilterType) => void;
  toggleCategory: (categoryId: string) => void;
  selectCity: (city?: string) => void;
  toggleDate: (date: FilterDate) => void;
  confirmSpecificDates: (startDate: string, endDate: string) => void;
  clearAll: () => void;
};

export function useFiltersDraft({
  initialFilters,
  isArabic,
  events,
  categories,
}: UseFiltersDraftArgs): UseFiltersDraftResult {
  const [draft, setDraft] = useState<EventFilters>(initialFilters ?? DEFAULT_EVENT_FILTERS);

  const categoryLabelById = getCategoryLabelByIdMap(categories, isArabic);

  const categoryOptions: FilterOption[] = getCategoryIdsForType(events, draft.type).map((id) => ({
    id,
    label: categoryLabelById[id] ?? id,
  }));

  const cityOptions = getCityOptions(events);

  const selectType = (type: FilterType) => {
    const nextCategories = getCategoryIdsForType(events, type);
    const nextCities = getCityOptions(events);

    setDraft((prev) => ({
      ...prev,
      type,
      timing: "all",
      activityMode: "all",
      categories: prev.categories.filter((categoryId) => nextCategories.includes(categoryId)),
      cities: prev.cities.filter((city) => nextCities.includes(city)),
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setDraft((prev) => ({
      ...prev,
      categories: toggleValue(prev.categories, categoryId),
    }));
  };

  const selectCity = (city?: string) => {
    setDraft((prev) => ({
      ...prev,
      cities: city ? [city] : [],
    }));
  };

  const toggleDate = (date: FilterDate) => {
    setDraft((prev) => ({
      ...prev,
      date: prev.date === date ? "any" : date,
      startDate: undefined,
      endDate: undefined,
    }));
  };

  const confirmSpecificDates = (startDate: string, endDate: string) => {
    setDraft((prev) => ({
      ...prev,
      date: "specificDates",
      startDate,
      endDate,
    }));
  };

  const clearAll = () => {
    setDraft(DEFAULT_EVENT_FILTERS);
  };

  return {
    draft,
    categoryOptions,
    cityOptions,
    selectType,
    toggleCategory,
    selectCity,
    toggleDate,
    confirmSpecificDates,
    clearAll,
  };
}
