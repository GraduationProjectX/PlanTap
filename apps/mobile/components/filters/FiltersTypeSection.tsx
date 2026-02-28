import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { FilterType } from "@/lib/event-filters";

import { FilterPill } from "./FilterPill";
import { FilterSection } from "./FilterSection";

type FiltersTypeSectionProps = {
  selectedType: FilterType;
  onSelectType: (type: FilterType) => void;
};

export function FiltersTypeSection({ selectedType, onSelectType }: FiltersTypeSectionProps) {
  const { t } = useTranslation();

  const typeOptions: { id: FilterType; label: string }[] = [
    { id: "event", label: t("filters.typeEvent") },
    { id: "activity", label: t("filters.typeActivity") },
    { id: "both", label: t("filters.typeBoth") },
  ];

  return (
    <FilterSection
      step={1}
      title={t("filters.whatLookingFor")}
      caption={t("filters.chooseExperience")}
    >
      <View style={styles.chipsRow}>
        {typeOptions.map((option) => (
          <FilterPill
            key={option.id}
            label={option.label}
            active={option.id === selectedType}
            onPress={() => onSelectType(option.id)}
          />
        ))}
      </View>
    </FilterSection>
  );
}

const styles = StyleSheet.create(() => ({
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
}));
