import { useMemo, useState } from "react";

import {
  getCategoryIdsForType,
  getCategoryLabelByIdMap,
  getCitiesForType,
  toggleValue,
  type FilterOption,
} from "@/lib/filters-screen-utils";
import {
  DEFAULT_EVENT_FILTERS,
  type EventFilters,
  type FilterDate,
  type FilterType,
} from "@/lib/event-filters";

type UseFiltersDraftArgs = {
  initialFilters: EventFilters | null;
  isArabic: boolean;
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

export function useFiltersDraft({ initialFilters, isArabic }: UseFiltersDraftArgs): UseFiltersDraftResult {
  const [draft, setDraft] = useState<EventFilters>(initialFilters ?? DEFAULT_EVENT_FILTERS);

  const categoryLabelById = useMemo(() => getCategoryLabelByIdMap(isArabic), [isArabic]);

  const categoryOptions = useMemo<FilterOption[]>(
    () =>
      getCategoryIdsForType(draft.type).map((id) => ({
        id,
        label: categoryLabelById[id] ?? id,
      })),
    [draft.type, categoryLabelById],
  );

  const cityOptions = useMemo(() => getCitiesForType(draft.type), [draft.type]);

  function selectType(type: FilterType) {
    const nextCategories = getCategoryIdsForType(type);
    const nextCities = getCitiesForType(type);

    setDraft((prev) => ({
      ...prev,
      type,
      timing: "all",
      activityMode: "all",
      categories: prev.categories.filter((categoryId) => nextCategories.includes(categoryId)),
      cities: prev.cities.filter((city) => nextCities.includes(city)),
    }));
  }

  function toggleCategory(categoryId: string) {
    setDraft((prev) => ({
      ...prev,
      categories: toggleValue(prev.categories, categoryId),
    }));
  }

  function selectCity(city?: string) {
    setDraft((prev) => ({
      ...prev,
      cities: city ? [city] : [],
    }));
  }

  function toggleDate(date: FilterDate) {
    setDraft((prev) => ({
      ...prev,
      date: prev.date === date ? "any" : date,
      startDate: undefined,
      endDate: undefined,
    }));
  }

  function confirmSpecificDates(startDate: string, endDate: string) {
    setDraft((prev) => ({
      ...prev,
      date: "specificDates",
      startDate,
      endDate,
    }));
  }

  function clearAll() {
    setDraft(DEFAULT_EVENT_FILTERS);
  }

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
