// City Selector Modal need Work, fix bottom padding and add icon for each city and make the modal look better in general.
import { View, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { Pressable } from "react-native-gesture-handler";
import { useState } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryChips } from "./CategoryChips";
import { CategoryChipsSkeleton } from "./CategoryChipsSkeleton";
import { Select } from "heroui-native";
import Fontisto from "@expo/vector-icons/Fontisto";

import type { CategoryDoc } from "@/hooks/use-categories";

type HomeHeaderTopProps = {
  city?: string;
  cityOptions: string[];
  onFavoritePress: () => void;
  onCitySelect: (city?: string) => void;
};

const ALL_CITIES_VALUE = "__all_cities__";
const CITY_OVERLAY_OPACITY_VALUES: [number, number, number] = [0, 1, 0];

type HomeHeaderStickyProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  categories?: CategoryDoc[];
  isCategoriesLoading?: boolean;
};

export function HomeHeaderTop({
  city,
  cityOptions,
  onFavoritePress,
  onCitySelect,
}: HomeHeaderTopProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { flexDirection, textAlign } = useDirection();
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState(false);

  const allCitiesLabel = t("filters.allCities");
  const selectedCityLabel = city ?? allCitiesLabel;
  const citySelectValue = {
    value: city ?? ALL_CITIES_VALUE,
    label: selectedCityLabel,
  };

  return (
    <View style={styles.topContainer}>
      <View style={[styles.topRow, { flexDirection }]}>
        <View style={styles.locationContainer}>
          <Select
            presentation="bottom-sheet"
            value={citySelectValue}
            isOpen={isCitySelectorOpen}
            onOpenChange={setIsCitySelectorOpen}
            onValueChange={(option) => {
              onCitySelect(option?.value === ALL_CITIES_VALUE ? undefined : option?.value);
            }}
          >
            <Select.Trigger style={styles.locationTrigger}>
              <Text style={styles.locationLabel}>{t("filters.city").toUpperCase()}</Text>
              <View style={[styles.cityRow, { flexDirection }]}>
                <View style={[styles.cityValueRow, { flexDirection }]}>
                  <FontAwesome name="map-marker" size={18} color={theme.colors.headerForeground} />
                  <Text style={[styles.cityText, { textAlign }]} numberOfLines={1}>
                    {selectedCityLabel}
                  </Text>
                </View>
                <FontAwesome name="chevron-down" size={10} color={theme.colors.headerMuted} />
              </View>
            </Select.Trigger>

            {isCitySelectorOpen ? (
              <Select.Portal>
                <Select.Overlay
                  animation={{
                    opacity: {
                      value: CITY_OVERLAY_OPACITY_VALUES,
                    },
                  }}
                  style={styles.cityOverlay}
                />
                <Select.Content presentation="bottom-sheet" snapPoints={["65%"]}>
                  <Select.ListLabel>{t("filters.city")}</Select.ListLabel>
                  <Select.Item value={ALL_CITIES_VALUE} label={allCitiesLabel} />
                  {cityOptions.map((cityOption) => (
                    <Select.Item key={cityOption} value={cityOption} label={cityOption} />
                  ))}
                  <View style={{ height: 100 }} />
                </Select.Content>
              </Select.Portal>
            ) : null}
          </Select>
        </View>

        <Pressable
          onPress={onFavoritePress}
          hitSlop={8}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.favoriteButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={t("bookmarks.title")}
        >
          <Fontisto name="bookmark" size={20} color={theme.colors.headerForeground} />
        </Pressable>
      </View>
    </View>
  );
}

export function HomeHeaderSticky({
  searchValue,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  onFilterPress,
  isFilterActive,
  categories: categoryItems = [],
  isCategoriesLoading = false,
}: HomeHeaderStickyProps) {
  const { t, i18n } = useTranslation();

  const isAr = i18n.language === "ar";
  const categories = categoryItems.map((category) => ({
    id: category.key,
    label: isAr ? category.labelAr : category.label,
    icon: category.icon,
  }));

  return (
    <View style={styles.stickyContainer}>
      <View>
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={t("home.search")}
          onFilterPress={onFilterPress}
          isFilterActive={isFilterActive}
        />
      </View>

      <View style={styles.chipsContainer}>
        {isCategoriesLoading ? (
          <CategoryChipsSkeleton />
        ) : (
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={onCategorySelect}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  topContainer: {
    backgroundColor: theme.colors.headerBackground,
    paddingTop: 8,
    paddingBottom: theme.spacing.sm,
  },
  stickyContainer: {
    backgroundColor: theme.colors.headerBackground,
    position: "relative",
    paddingTop: 6,
    paddingBottom: 12,
    gap: theme.spacing.sm,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    zIndex: 20,
    elevation: 0,
  },
  topRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    marginBottom: 12,
  },
  locationContainer: {
    minWidth: "25%",
    maxWidth: "75%",
  },
  locationTrigger: {
    borderRadius: 16,
    borderCurve: "continuous",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.headerOverlay,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    alignItems: "flex-start",
    gap: 2,
  },
  cityOverlay: {
    backgroundColor: theme.colors.overlayDark,
  },
  locationLabel: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
    color: theme.colors.headerMuted,
    letterSpacing: theme.font.letterSpacing.widest,
    paddingRight: 4,
  },
  cityRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cityValueRow: {
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  cityText: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.headerForeground,
    flexShrink: 1,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.headerOverlay,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButtonPressed: {
    opacity: 0.75,
  },
  chipsContainer: {
    marginTop: 4,
  },
}));
