import { View, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryChips } from "./CategoryChips";
import { CategoryChipsSkeleton } from "./CategoryChipsSkeleton";
import { Button, Select } from "heroui-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import Animated, {
  Extrapolation,
  interpolate,
  useDerivedValue,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

type HomeHeaderTopProps = {
  city?: string;
  cityOptions: string[];
  onFavoritePress?: () => void;
  onCitySelect?: (city?: string) => void;
};

const ALL_CITIES_VALUE = "__all_cities__";

type CategoryItem = { key?: string; id?: string; label: string; labelAr: string };

type HomeHeaderStickyProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  scrollY?: SharedValue<number>;
  categories?: CategoryItem[];
  isCategoriesLoading?: boolean;
};

type HomeHeaderProps = HomeHeaderTopProps & Omit<HomeHeaderStickyProps, "categories"> & { categories?: CategoryItem[] };

export function HomeHeaderTop({
  city,
  cityOptions,
  onFavoritePress,
  onCitySelect,
}: HomeHeaderTopProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { flexDirection, textAlign } = useDirection();
  const insets = useSafeAreaInsets();
  const cityListBottomPadding = 100;

  const allCitiesLabel = t("filters.allCities");
  const selectedCityLabel = city ?? allCitiesLabel;

  return (
    <View style={[styles.topContainer, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.topRow, { flexDirection }]}>
        <View style={styles.locationContainer}>
          <Select
            presentation="bottom-sheet"
            value={{
              value: city ?? ALL_CITIES_VALUE,
              label: selectedCityLabel,
            }}
            onValueChange={(option) => {
              onCitySelect?.(option?.value === ALL_CITIES_VALUE ? undefined : option?.value);
            }}
          >
            <Select.Trigger style={styles.locationTrigger}>
              <Text style={styles.locationLabel}>{t("filters.city").toUpperCase()}</Text>
              <View style={[styles.cityRow, { flexDirection }]}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={[styles.cityText, { textAlign }]} numberOfLines={1}>
                  {selectedCityLabel}
                </Text>
                <FontAwesome name="chevron-down" size={10} color={theme.colors.headerMuted} />
              </View>
            </Select.Trigger>

            <Select.Portal>
              <Select.Overlay
                animation={{
                  opacity: {
                    value: [0, 1, 0] as [number, number, number],
                  },
                }}
                style={styles.cityOverlay}
              />
              <Select.Content presentation="bottom-sheet">
                <Select.ListLabel>{t("filters.city")}</Select.ListLabel>
                  <Select.Item value={ALL_CITIES_VALUE} label={allCitiesLabel}>
                    <View style={styles.cityOptionInner}>
                      <Text style={styles.cityOptionIcon}>🌍</Text>
                      <Select.ItemLabel />
                    </View>
                    <Select.ItemIndicator />
                  </Select.Item>
                  {cityOptions.map((cityOption) => (
                    <Select.Item key={cityOption} value={cityOption} label={cityOption}>
                      <View style={styles.cityOptionInner}>
                        <Text style={styles.cityOptionIcon}>🏢</Text>
                        <Select.ItemLabel />
                      </View>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                  <View style={{ height: cityListBottomPadding }} />
              </Select.Content>
            </Select.Portal>
          </Select>
        </View>

        <Button
          onPress={onFavoritePress}
          style={styles.favoriteButton}
          hitSlop={8}
          isIconOnly
          feedbackVariant="scale"
        >
          <Fontisto name="bookmark" size={20} color={theme.colors.headerForeground} />
        </Button>
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
  scrollY,
  categories: categoryItems = [],
  isCategoriesLoading = false,
}: HomeHeaderStickyProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const collapsedTopPadding = insets.top + 6;
  const expandedTopPadding = 4;
  const topInsetDelta = Math.max(0, collapsedTopPadding - expandedTopPadding);

  const isAr = i18n.language === "ar";
  const categories = categoryItems
    .map((c) => {
      const normalizedId = c.key ?? c.id ?? c.label.trim().toLowerCase().replace(/\s+/g, "-");
      if (!normalizedId) {
        return null;
      }

      return {
        id: normalizedId,
        label: isAr ? c.labelAr : c.label,
      };
    })
    .filter((item): item is { id: string; label: string } => item !== null);

  const collapseProgress = useDerivedValue(() => {
    const offsetY = scrollY?.get() ?? 0;
    return interpolate(offsetY, [0, 120], [0, 1], Extrapolation.CLAMP);
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    const progress = collapseProgress.get();

    return {
      opacity: interpolate(progress, [0, 1], [1, 0.98], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            progress,
            [0, 1],
            [-topInsetDelta, -2],
            Extrapolation.CLAMP,
          ),
        },
        { scale: interpolate(progress, [0, 1], [1, 0.985], Extrapolation.CLAMP) },
      ],
    };
  });

  const chipsAnimatedStyle = useAnimatedStyle(() => {
    const progress = collapseProgress.get();

    return {
      opacity: interpolate(progress, [0, 1], [1, 0.9], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            progress,
            [0, 1],
            [-topInsetDelta * 0.65, -6],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.stickyContainer,
        { paddingTop: collapsedTopPadding, paddingBottom: 12 },
      ]}
    >
      <Animated.View style={searchAnimatedStyle} pointerEvents="box-none">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={t("home.search")}
          onFilterPress={onFilterPress}
          isFilterActive={isFilterActive}
        />
      </Animated.View>

      <Animated.View style={[styles.chipsContainer, chipsAnimatedStyle]}>
        {isCategoriesLoading ? (
          <CategoryChipsSkeleton />
        ) : (
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={onCategorySelect}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
}

export function HomeHeader(props: HomeHeaderProps) {
  return (
    <View>
      <HomeHeaderTop
        city={props.city}
        cityOptions={props.cityOptions}
        onFavoritePress={props.onFavoritePress}
        onCitySelect={props.onCitySelect}
      />
      <HomeHeaderSticky
        searchValue={props.searchValue}
        onSearchChange={props.onSearchChange}
        selectedCategory={props.selectedCategory}
        onCategorySelect={props.onCategorySelect}
        onFilterPress={props.onFilterPress}
        isFilterActive={props.isFilterActive}
        scrollY={props.scrollY}
        categories={props.categories}
        isCategoriesLoading={props.isCategoriesLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  topContainer: {
    backgroundColor: theme.colors.headerBackground,
    paddingBottom: theme.spacing.sm,
  },
  stickyContainer: {
    backgroundColor: theme.colors.headerBackground,
    position: "relative",
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    zIndex: 20,
    elevation: 8,
  },
  topRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    marginBottom: 12,
  },
  locationContainer: {
    // flex: 1,
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
  },
  cityRow: {
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 14,
  },
  cityText: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.headerForeground,
    flexShrink: 1,
  },
  cityOptionInner: {
    flexDirection: "row",
    alignItems: "center",
    // gap: 10,
    flex: 1,
  },
  cityOptionIcon: {
    fontSize: 18,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.headerOverlay,
    alignItems: "center",
    justifyContent: "center",
  },
  chipsContainer: {
    marginTop: 4,
  },
}));
