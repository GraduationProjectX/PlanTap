import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeHeaderSticky, HomeHeaderTop } from "@/components/home/HomeHeader";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { OngoingEventsCarousel } from "@/components/home/OngoingEventsCarousel";
import { UpcomingEventsList } from "@/components/home/UpcomingEventsList";
import { EventCard } from "@/components/events/EventCard";
import { useEvents, type EventDoc } from "@/hooks/use-events";
import { useCategories } from "@/hooks/use-categories";
import { getCitiesForType } from "@/lib/filters-screen-utils";
import { detectCityFromUserLocation } from "@/lib/location-city";

type ViewAllEventType = "ongoing" | "upcoming" | "activity" | "all";

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState<string | undefined>();

  const {
    events,
    collections,
    isLoading: isEventsLoading,
  } = useEvents();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const cityOptions = getCitiesForType(events ?? [], "both");

  useEffect(() => {
    if (cityOptions.length === 0) return;

    let isMounted = true;

    const detectCity = async () => {
      const detectedCity = await detectCityFromUserLocation(cityOptions);
      if (!isMounted || !detectedCity) {
        return;
      }

      setSelectedCity(detectedCity);
    };

    void detectCity();

    return () => {
      isMounted = false;
    };
  }, [events]);

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}` as Href);
  };

  const query = searchValue.trim().toLowerCase();

  const handleViewAll = (type: ViewAllEventType) => {
    const params = new URLSearchParams({ type });

    if (selectedCity) {
      params.set("city", selectedCity);
    }

    if (selectedCategory !== "all") {
      params.set("homeCategory", selectedCategory);
    }

    router.push(`/event?${params.toString()}` as Href);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleFilterPress = () => {
    router.push("/filters?targetType=all" as Href);
  };

  const matchesSearch = (event: EventDoc) => {
    if (query.length === 0) {
      return true;
    }

    const fields = [
      event.title,
      event.titleAr,
      event.descriptionShort,
      event.descriptionShortAr,
      event.city,
      ...event.categories,
      ...event.tags,
    ].filter(Boolean) as string[];

    return fields.some((field) => field.toLowerCase().includes(query));
  };

  const matchesCategory = (event: EventDoc) => {
    if (selectedCategory === "all") {
      return true;
    }

    return event.categories.includes(selectedCategory);
  };

  const matchesHomeHeaderFilters = (event: EventDoc) => {
    if (selectedCity && event.city !== selectedCity) {
      return false;
    }

    return matchesCategory(event) && matchesSearch(event);
  };

  const activityCardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

  const ongoingEvents = (collections?.ongoing ?? []).filter(matchesHomeHeaderFilters);
  const upcomingEvents = (collections?.upcoming ?? []).filter(matchesHomeHeaderFilters);
  const activityEvents = (collections?.activity ?? []).filter(matchesHomeHeaderFilters);

  const hasAnyVisibleEvents =
    ongoingEvents.length > 0 || upcomingEvents.length > 0 || activityEvents.length > 0;
  const hasSearchOrCategoryFilter = query.length > 0 || selectedCategory !== "all";

  const emptyStateMessage =
    selectedCity && !hasSearchOrCategoryFilter
      ? t("home.noEventsInCity", { city: selectedCity })
      : t("home.noResultsFound");
  const showTryAnotherCity = selectedCity && !hasSearchOrCategoryFilter;

  const ongoingTitle = selectedCity
    ? t("home.ongoingEventsInCity", { city: selectedCity })
    : t("home.ongoingEvents");
  const upcomingTitle = selectedCity
    ? t("home.upcomingInCity", { city: selectedCity })
    : t("home.upcoming");
  const activitiesTitle = selectedCity
    ? t("home.activitiesInCity", { city: selectedCity })
    : t("home.activities");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {insets.top > 0 && (
        <View
          pointerEvents="none"
          style={[styles.statusBarBackground, { height: insets.top }]}
        />
      )}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <HomeHeaderTop
          city={selectedCity}
          cityOptions={cityOptions}
          onFavoritePress={() => router.push("/bookmarks" as Href)}
          onCitySelect={setSelectedCity}
        />
        <HomeHeaderSticky
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          onFilterPress={handleFilterPress}
          isFilterActive={false}
          categories={categories}
          isCategoriesLoading={isCategoriesLoading}
        />

        {isEventsLoading ? (
          <HomeSkeleton />
        ) : (
          <>
            {ongoingEvents.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={ongoingTitle}
                  actionLabel={t("home.viewAll")}
                  onAction={() => handleViewAll("ongoing")}
                />
                <OngoingEventsCarousel
                  events={ongoingEvents}
                  onEventPress={handleEventPress}
                />
              </View>
            )}

            {activityEvents.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={activitiesTitle}
                  actionLabel={t("home.viewAll")}
                  onAction={() => handleViewAll("activity")}
                />
                <View style={styles.activitiesGrid}>
                  {activityEvents.slice(0, 4).map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      variant="medium"
                      onPress={handleEventPress}
                      width={activityCardWidth}
                    />
                  ))}
                </View>
              </View>
            )}

            {upcomingEvents.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={upcomingTitle}
                  actionLabel={t("home.viewAll")}
                  onAction={() => handleViewAll("upcoming")}
                />
                <UpcomingEventsList
                  events={upcomingEvents}
                  onEventPress={handleEventPress}
                />
              </View>
            )}

            {!hasAnyVisibleEvents && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>{emptyStateMessage}</Text>
                {showTryAnotherCity && <Text style={styles.emptyHint}>{t("home.tryAnotherCity")}</Text>}
              </View>
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.headerBackground,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  emptyContainer: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: HORIZONTAL_PADDING,
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  emptyTitle: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: COLUMN_GAP,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
}));

