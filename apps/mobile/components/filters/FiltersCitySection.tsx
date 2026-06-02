import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Select } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { getCityDisplayLabel } from "@/features/filters/utils";
import { useDirection } from "@/rtl";

import { FilterSection } from "./FilterSection";

type SelectValue = { value: string; label: string } | undefined;

const ALL_CITIES_VALUE = "__all_cities__";
const CITY_SELECT_INDICATOR_ROTATION_VALUES: [number, number] = [0, -180];
const CITY_SELECT_OVERLAY_OPACITY_VALUES: [number, number, number] = [0, 1, 0];

const CITY_SELECT_INDICATOR_ANIMATION = {
  rotation: {
    value: CITY_SELECT_INDICATOR_ROTATION_VALUES,
    springConfig: {
      damping: 80,
      stiffness: 900,
      mass: 2.5,
    },
  },
};

const CITY_SELECT_OVERLAY_ANIMATION = {
  opacity: {
    value: CITY_SELECT_OVERLAY_OPACITY_VALUES,
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
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { flexDirection } = useDirection();
  const insets = useSafeAreaInsets();
  const isArabic = i18n.language === "ar";
  const cityModalBottomSpacer =
    (Platform.OS === "android" ? Math.max(insets.bottom, 32) : insets.bottom) + 16;

  const allCitiesLabel = t("filters.allCities");

  const citySelectValue: SelectValue = selectedCity
    ? { value: selectedCity, label: getCityDisplayLabel(selectedCity, isArabic) }
    : { value: ALL_CITIES_VALUE, label: allCitiesLabel };

  return (
    <FilterSection step={3} title={t("filters.city")} caption={t("filters.whereToLook")}>
      <Select
        presentation="bottom-sheet"
        value={citySelectValue}
        onValueChange={(option) => {
          onSelectCity(option?.value === ALL_CITIES_VALUE ? undefined : option?.value);
        }}
      >
        <Select.Trigger style={styles.selectTrigger}>
          <View style={[styles.selectInner, { flexDirection }]}>
            <FontAwesome name="building-o" size={16} />
            <Select.Value placeholder={t("filters.selectCity")} />
          </View>
          <Select.TriggerIndicator animation={CITY_SELECT_INDICATOR_ANIMATION}>
            <FontAwesome
              name="chevron-down"
              size={theme.font.size.base}
              color={theme.colors.textMuted}
            />
          </Select.TriggerIndicator>
        </Select.Trigger>

        <Select.Portal>
          <Select.Overlay
            animation={CITY_SELECT_OVERLAY_ANIMATION}
            style={CITY_SELECT_OVERLAY_STYLE}
          />
          <Select.Content presentation="bottom-sheet" snapPoints={["65%"]}>
            <Select.ListLabel>{t("filters.city")}</Select.ListLabel>
            <Select.Item value={ALL_CITIES_VALUE} label={allCitiesLabel}>
              <View style={styles.selectItemInner}>
                <FontAwesome name="globe" size={16} />
                <Select.ItemLabel />
              </View>
              <Select.ItemIndicator />
            </Select.Item>
            {cityOptions.map((city) => (
              <Select.Item key={city} value={city} label={getCityDisplayLabel(city, isArabic)}>
                <View style={styles.selectItemInner}>
                  <FontAwesome name="building-o" size={16} />
                  <Select.ItemLabel />
                </View>
                <Select.ItemIndicator />
              </Select.Item>
            ))}
            <View style={{ height: cityModalBottomSpacer }} />
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
  selectItemInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
}));
