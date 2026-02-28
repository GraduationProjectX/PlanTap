import { Select } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useDirection } from "@/rtl";

import { FilterSection } from "./FilterSection";

type SelectValue = { value: string; label: string } | undefined;

type FiltersCitySectionProps = {
  cityOptions: string[];
  selectedCity?: string;
  onSelectCity: (city?: string) => void;
};

export function FiltersCitySection({
  cityOptions,
  selectedCity,
  onSelectCity,
}: FiltersCitySectionProps) {
  const { t } = useTranslation();
  const { flexDirection } = useDirection();

  const citySelectValue: SelectValue = selectedCity ? { value: selectedCity, label: selectedCity } : undefined;

  return (
    <FilterSection step={3} title={t("filters.city")} caption={t("filters.whereToLook")}>
      <Select
        presentation="bottom-sheet"
        value={citySelectValue}
        onValueChange={(option) => {
          onSelectCity(option?.value);
        }}
      >
        <Select.Trigger style={styles.selectTrigger}>
          <View style={[styles.selectInner, { flexDirection }]}>
            <Text style={styles.selectEmoji}>🏢</Text>
            <Select.Value placeholder={t("filters.selectCity")} />
          </View>
          <Select.TriggerIndicator />
        </Select.Trigger>

        <Select.Portal>
          <Select.Overlay />
          <Select.Content presentation="bottom-sheet" snapPoints={["35%"]}>
            <Select.ListLabel>{t("filters.city")}</Select.ListLabel>
            {cityOptions.map((city) => (
              <Select.Item key={city} value={city} label={city}>
                <View style={styles.selectItemInner}>
                  <Text style={styles.selectEmoji}>🏢</Text>
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
    </FilterSection>
  );
}

const styles = StyleSheet.create(() => ({
  selectTrigger: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1.2,
    borderColor: "#E2E2E2",
    backgroundColor: "#FFF",
  },
  selectInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  selectEmoji: {
    fontSize: 18,
  },
  selectItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
}));
