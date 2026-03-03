import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryChips } from "./CategoryChips";
import { CATEGORIES } from "@/data/mock-events";
import { Button } from "heroui-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

type HomeHeaderTopProps = {
  city: string;
  onFavoritePress?: () => void;
  onLocationPress?: () => void;
};

type HomeHeaderStickyProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (id: string) => void;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  scrollY?: SharedValue<number>;
};

type HomeHeaderProps = HomeHeaderTopProps & HomeHeaderStickyProps;

export function HomeHeaderTop({
  city,
  onFavoritePress,
  onLocationPress,
}: HomeHeaderTopProps) {
  const { t } = useTranslation();
  const { flexDirection, textAlign } = useDirection();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.topContainer, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.topRow, { flexDirection }]}>
        <View style={styles.locationContainer}>
          <Pressable onPress={onLocationPress}>
            <Text style={styles.locationLabel}>{t("home.currentLocation").toUpperCase()}</Text>
            <View style={[styles.cityRow, { flexDirection }]}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={[styles.cityText, { textAlign }]}>{city}</Text>
              <FontAwesome name="chevron-down" size={10} color="rgba(255,255,255,0.8)" />
            </View>
          </Pressable>
        </View>

        <Button
          onPress={onFavoritePress}
          style={styles.favoriteButton}
          hitSlop={8}
          isIconOnly
          feedbackVariant="scale"
        >
          <Fontisto name="bookmark" size={20} color="white" />
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
}: HomeHeaderStickyProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const isAr = i18n.language === "ar";
  const categories = CATEGORIES.map((c) => ({
    id: c.id,
    label: isAr ? c.labelAr : c.label,
  }));

  const stickyAnimatedStyle = useAnimatedStyle(() => {
    const offsetY = scrollY?.value ?? 0;
    const progress = interpolate(offsetY, [0, 90], [0, 1], Extrapolation.CLAMP);

    return {
      backgroundColor: interpolateColor(progress, [0, 1], ["#1E1E1E", "#161616"]),
      paddingTop: interpolate(progress, [0, 1], [4, insets.top + 6]),
      paddingBottom: interpolate(progress, [0, 1], [24, 12]),
      transform: [{ translateY: interpolate(progress, [0, 1], [0, -2]) }],
    };
  });

  const searchAnimatedStyle = useAnimatedStyle(() => {
    const offsetY = scrollY?.value ?? 0;
    const progress = interpolate(offsetY, [0, 120], [0, 1], Extrapolation.CLAMP);

    return {
      transform: [
        { scale: interpolate(progress, [0, 1], [1, 0.985]) },
        { translateY: interpolate(progress, [0, 1], [0, -2]) },
      ],
    };
  });

  const chipsAnimatedStyle = useAnimatedStyle(() => {
    const offsetY = scrollY?.value ?? 0;
    const progress = interpolate(offsetY, [0, 120], [0, 1], Extrapolation.CLAMP);

    return {
      opacity: interpolate(progress, [0, 1], [1, 0.93]),
      transform: [{ translateY: interpolate(progress, [0, 1], [0, -4]) }],
    };
  });

  return (
    <Animated.View style={[styles.stickyContainer, stickyAnimatedStyle]}>
      <Animated.View style={searchAnimatedStyle}>
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={t("home.search")}
          onFilterPress={onFilterPress}
          isFilterActive={isFilterActive}
        />
      </Animated.View>

      <Animated.View style={[styles.chipsContainer, chipsAnimatedStyle]}>
        <CategoryChips
          categories={categories}
          selected={selectedCategory}
          onSelect={onCategorySelect}
        />
      </Animated.View>
    </Animated.View>
  );
}

export function HomeHeader(props: HomeHeaderProps) {
  return (
    <View>
      <HomeHeaderTop
        city={props.city}
        onFavoritePress={props.onFavoritePress}
        onLocationPress={props.onLocationPress}
      />
      <HomeHeaderSticky
        searchValue={props.searchValue}
        onSearchChange={props.onSearchChange}
        selectedCategory={props.selectedCategory}
        onCategorySelect={props.onCategorySelect}
        onFilterPress={props.onFilterPress}
        isFilterActive={props.isFilterActive}
        scrollY={props.scrollY}
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
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    zIndex: 20,
  },
  topRow: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    marginBottom: 12,
  },
  locationContainer: {
    gap: 2,
  },
  locationLabel: {
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.medium,
    color: "rgba(255, 255, 255, 0.5)",
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
    color: "#FFFFFF",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipsContainer: {
    marginTop: 4,
  },
}));
