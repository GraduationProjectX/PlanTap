import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { FiltersApplyBar } from "@/components/filters/FiltersApplyBar";
import { FiltersCategorySection } from "@/components/filters/FiltersCategorySection";
import { FiltersCitySection } from "@/components/filters/FiltersCitySection";
import { FiltersDateSection } from "@/components/filters/FiltersDateSection";
import { FiltersSkeleton } from "@/components/filters/FiltersSkeleton";
import { FiltersTopBar } from "@/components/filters/FiltersTopBar";
import { FiltersTypeSection } from "@/components/filters/FiltersTypeSection";
import { SkeletonScreenTransition } from "@/components/ui/SkeletonScreenTransition";
import { useCategories } from "@/hooks/use-categories";
import { useEvents } from "@/hooks/use-events";
import { useFiltersDraft } from "@/hooks/use-filters-draft";
import { DISCOVERY_EVENTS_LIMIT, normalizeEventListType } from "@/features/events/data";
import { useEventFiltersStore } from "@/stores/event-filters-store";

export default function FiltersScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { targetType } = useLocalSearchParams<{ targetType?: string | string[] }>();

  const targetTypeParam = Array.isArray(targetType) ? targetType[0] : targetType;
  const normalizedTargetType = targetTypeParam ? normalizeEventListType(targetTypeParam) : "all";
  const isArabic = i18n.language === "ar";

  const appliedFilters = useEventFiltersStore((state) => state.appliedFilters);
  const setAppliedFilters = useEventFiltersStore((state) => state.setAppliedFilters);
  const { events, isLoading: isEventsLoading } = useEvents(undefined, true, {
    limit: DISCOVERY_EVENTS_LIMIT,
  });
  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const {
    draft,
    categoryOptions,
    cityOptions,
    selectType,
    toggleCategory,
    selectCity,
    toggleDate,
    confirmSpecificDates,
    clearAll,
  } = useFiltersDraft({
    initialFilters: appliedFilters,
    isArabic,
    events: events ?? [],
    categories,
  });

  const isInitialLoading = isEventsLoading || isCategoriesLoading;

  const scrollContentStyle = [styles.scrollContent, { paddingBottom: insets.bottom + 110 }];

  const handleApply = () => {
    setAppliedFilters(draft);
    router.replace({
      pathname: "/event",
      params: { type: normalizedTargetType, source: "filters" },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SkeletonScreenTransition
      isLoading={isInitialLoading}
      skeleton={<FiltersSkeleton topInset={88} />}
    >
      <View style={styles.root}>
        <FiltersTopBar onBack={handleBack} onClearAll={clearAll} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollContentStyle}>
          <FiltersTypeSection selectedType={draft.type} onSelectType={selectType} />

          <FiltersCategorySection
            options={categoryOptions}
            selectedCategoryIds={draft.categories}
            onToggleCategory={toggleCategory}
          />

          <FiltersCitySection
            cityOptions={cityOptions}
            selectedCity={draft.cities[0]}
            onSelectCity={selectCity}
          />

          <FiltersDateSection
            activeDate={draft.date}
            startDate={draft.startDate}
            endDate={draft.endDate}
            onToggleDate={toggleDate}
            onConfirmSpecificDates={confirmSpecificDates}
          />
        </ScrollView>

        <FiltersApplyBar onApply={handleApply} />
      </View>
    </SkeletonScreenTransition>
  );
}

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 32,
  },
}));
