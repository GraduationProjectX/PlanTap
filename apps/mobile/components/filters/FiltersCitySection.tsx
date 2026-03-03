import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Select } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ICON_COLORS, ICON_SIZES } from "@/lib/icon-tokens";
import { useDirection } from "@/rtl";

import { FilterSection } from "./FilterSection";

type SelectValue = { value: string; label: string } | undefined;

const CITY_SELECT_INDICATOR_ANIMATION = {
  rotation: {
    value: [0, -180] as [number, number],
    springConfig: {
      damping: 80,
      stiffness: 900,
      mass: 2.5,
    },
  },
};

const CITY_SELECT_OVERLAY_ANIMATION = {
  opacity: {
    value: [0, 1, 0] as [number, number, number],
  },
};

const CITY_SELECT_OVERLAY_STYLE = {
  backgroundColor: "rgba(10, 14, 24, 0.68)",
};

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

  const citySelectValue: SelectValue = selectedCity
    ? { value: selectedCity, label: selectedCity }
    : undefined;

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
          <Select.TriggerIndicator animation={CITY_SELECT_INDICATOR_ANIMATION}>
            <FontAwesome
              name="chevron-down"
              size={ICON_SIZES.chevronDisclosure}
              color={ICON_COLORS.chevronMuted}
            />
          </Select.TriggerIndicator>
        </Select.Trigger>

        <Select.Portal>
          <Select.Overlay
            animation={CITY_SELECT_OVERLAY_ANIMATION}
            style={CITY_SELECT_OVERLAY_STYLE}
          />
          <Select.Content
            presentation="bottom-sheet"
            snapPoints={["65%"]}
          >
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
