import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { FiltersApplyBar } from "@/components/filters/FiltersApplyBar";
import { FiltersCategorySection } from "@/components/filters/FiltersCategorySection";
import { FiltersCitySection } from "@/components/filters/FiltersCitySection";
import { FiltersDateSection } from "@/components/filters/FiltersDateSection";
import { FiltersTopBar } from "@/components/filters/FiltersTopBar";
import { FiltersTypeSection } from "@/components/filters/FiltersTypeSection";
import { useFiltersDraft } from "@/hooks/use-filters-draft";
import { normalizeEventListType } from "@/lib/event-list-type";
import { useEventFiltersStore } from "@/stores/event-filters-store";

export default function FiltersScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { targetType } = useLocalSearchParams<{ targetType?: string | string[] }>();

  const targetTypeParam = Array.isArray(targetType) ? targetType[0] : targetType;
  const normalizedTargetType = targetTypeParam ? normalizeEventListType(targetTypeParam) : "all";

  const appliedFilters = useEventFiltersStore((state) => state.appliedFilters);
  const setAppliedFilters = useEventFiltersStore((state) => state.setAppliedFilters);

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
    isArabic: i18n.language === "ar",
  });

  function handleApply() {
    setAppliedFilters(draft);
    router.replace(`/event?type=${normalizedTargetType}&source=filters` as Href);
  }

  return (
    <View style={styles.root}>
      <FiltersTopBar onBack={() => router.back()} onClearAll={clearAll} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
      >
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
