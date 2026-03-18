import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { FilterOption } from "@/features/filters/utils";

import { FilterPill } from "./FilterPill";
import { FilterSection } from "./FilterSection";

type FiltersCategorySectionProps = {
  options: FilterOption[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
};

export function FiltersCategorySection({
  options,
  selectedCategoryIds,
  onToggleCategory,
}: FiltersCategorySectionProps) {
  const { t } = useTranslation();
  const selectedCategoryIdsSet = new Set(selectedCategoryIds);

  return (
    <FilterSection step={2} title={t("filters.categories")} caption={t("filters.selectTopics")}>
      <View style={styles.chipsWrap}>
        {options.map((option) => (
          <FilterPill
            key={option.id}
            label={option.label}
            active={selectedCategoryIdsSet.has(option.id)}
            onPress={() => onToggleCategory(option.id)}
          />
        ))}
      </View>
    </FilterSection>
  );
}

const styles = StyleSheet.create(() => ({
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
}));
