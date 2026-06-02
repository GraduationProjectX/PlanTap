import { useRef, useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeHeaderSticky, HomeHeaderTop } from "@/components/home/HomeHeader";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { SectionHeader } from "@/components/home/SectionHeader";
import { OngoingEventsCarousel } from "@/components/home/OngoingEventsCarousel";
import { UpcomingEventsList } from "@/components/home/UpcomingEventsList";
import { EventCard } from "@/components/events/EventCard";
import { DISCOVERY_EVENTS_LIMIT, useEvents, type EventDoc } from "@/hooks/use-events";
import { useCategories } from "@/hooks/use-categories";
import { getCityDisplayLabel, getCityOptions } from "@/features/filters/utils";

type ViewAllEventType = "ongoing" | "upcoming" | "activity" | "all";

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { collections: eventCollections, isLoading: isEventsLoading } = useEvents(undefined, true, {
    type: "event",
    limit: DISCOVERY_EVENTS_LIMIT,
  });
  const { events: activitySourceEvents, isLoading: isActivitiesLoading } = useEvents(
    undefined,
    true,
    {
      type: "activity",
      limit: DISCOVERY_EVENTS_LIMIT,
    },
  );
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const events = [...(eventCollections?.all ?? []), ...(activitySourceEvents ?? [])];
  const cityOptions = getCityOptions(events ?? []);
  const activeCity = selectedCity ?? undefined;
  const activeCityLabel = activeCity
    ? getCityDisplayLabel(activeCity, i18n.language === "ar")
    : undefined;
  const activeCategory = selectedCategory ?? "all";
  const isHomeLoading = isEventsLoading || isActivitiesLoading;

  const handleEventPress = (id: string) => {
    router.push({ pathname: "/event/[id]", params: { id } });
  };

  const query = searchValue.trim().toLowerCase();

  const handleViewAll = (type: ViewAllEventType) => {
    const params: Record<string, string> = { type };

    if (activeCity) {
      params.city = activeCity;
    }

    if (activeCategory !== "all") {
      params.homeCategory = activeCategory;
    }

    router.push({ pathname: "/event", params });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleFilterPress = () => {
    router.push({ pathname: "/filters", params: { targetType: "all" } });
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
    ].filter((field): field is string => field != null && field.length > 0);

    return fields.some((field) => field.toLowerCase().includes(query));
  };

  const matchesCategory = (event: EventDoc) => {
    if (activeCategory === "all") {
      return true;
    }

    return event.categories.includes(activeCategory);
  };

  const matchesHomeHeaderFilters = (event: EventDoc) => {
    if (activeCity && event.city !== activeCity) {
      return false;
    }

    return matchesCategory(event) && matchesSearch(event);
  };

  const activityCardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

  const ongoingEvents = (eventCollections?.ongoing ?? []).filter(matchesHomeHeaderFilters);
  const upcomingEvents = (eventCollections?.upcoming ?? []).filter(matchesHomeHeaderFilters);
  const activityEvents = (activitySourceEvents ?? []).filter(matchesHomeHeaderFilters);

  const hasAnyVisibleEvents =
    ongoingEvents.length > 0 || upcomingEvents.length > 0 || activityEvents.length > 0;
  const hasSearchOrCategoryFilter = query.length > 0 || activeCategory !== "all";

  const emptyStateMessage =
    activeCityLabel && !hasSearchOrCategoryFilter
      ? t("home.noEventsInCity", { city: activeCityLabel })
      : t("home.noResultsFound");
  const showTryAnotherCity = activeCityLabel && !hasSearchOrCategoryFilter;

  const ongoingTitle = activeCityLabel
    ? t("home.ongoingEventsInCity", { city: activeCityLabel })
    : t("home.ongoingEvents");
  const upcomingTitle = activeCityLabel
    ? t("home.upcomingInCity", { city: activeCityLabel })
    : t("home.upcoming");
  const activitiesTitle = activeCityLabel
    ? t("home.activitiesInCity", { city: activeCityLabel })
    : t("home.activities");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {insets.top > 0 && (
        <View pointerEvents="none" style={[styles.statusBarBackground, { height: insets.top }]} />
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
          city={activeCity}
          cityOptions={cityOptions}
          onFavoritePress={() => router.push("/bookmarks")}
          onCitySelect={(city) => setSelectedCity(city ?? null)}
        />
        <HomeHeaderSticky
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          onFilterPress={handleFilterPress}
          isFilterActive={false}
          categories={categories}
          isCategoriesLoading={isCategoriesLoading}
        />

        {isHomeLoading ? (
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
                <OngoingEventsCarousel events={ongoingEvents} onEventPress={handleEventPress} />
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
                <UpcomingEventsList events={upcomingEvents} onEventPress={handleEventPress} />
              </View>
            )}

            {!hasAnyVisibleEvents && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>{emptyStateMessage}</Text>
                {showTryAnotherCity && (
                  <Text style={styles.emptyHint}>{t("home.tryAnotherCity")}</Text>
                )}
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
