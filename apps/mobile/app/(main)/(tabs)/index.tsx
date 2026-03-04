import { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import { HomeHeaderSticky, HomeHeaderTop } from "@/components/home/HomeHeader";
import { SectionHeader } from "@/components/home/SectionHeader";
import { OngoingEventsCarousel } from "@/components/home/OngoingEventsCarousel";
import { UpcomingEventsList } from "@/components/home/UpcomingEventsList";
import { MediumEventCard } from "@/components/home/MediumEventCard";
import { ACTIVITY_EVENTS, ONGOING_EVENTS, UPCOMING_EVENTS } from "@/data/mock-events";
import { getCitiesForType } from "@/lib/filters-screen-utils";
import { detectCityFromUserLocation } from "@/lib/location-city";

type ViewAllEventType = "ongoing" | "upcoming" | "activity" | "all";

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollY = useSharedValue(0);
  const { width: screenWidth } = useWindowDimensions();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState<string | undefined>();

  const cityOptions = getCitiesForType("both");

  useEffect(() => {
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
  }, [cityOptions]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}` as Href);
  };

  const handleViewAll = (type: ViewAllEventType) => {
    const params = new URLSearchParams({ type });

    if (selectedCity) {
      params.set("city", selectedCity);
    }

    router.push(`/event?${params.toString()}` as Href);
  };

  const handleViewAllOngoing = () => handleViewAll("ongoing");
  const handleViewAllUpcoming = () => handleViewAll("upcoming");
  const handleViewAllActivity = () => handleViewAll("activity");
  const handleFilterPress = () => {
    router.push("/filters?targetType=all" as Href);
  };

  const cityMatches = (city: string) => !selectedCity || city === selectedCity;
  const activityCardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

  const ongoingEvents = ONGOING_EVENTS.filter((event) => cityMatches(event.city));
  const upcomingEvents = UPCOMING_EVENTS.filter((event) => cityMatches(event.city));
  const activityEvents = ACTIVITY_EVENTS.filter((event) => cityMatches(event.city));

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
    <View style={styles.root}>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        onScroll={onScroll}
        scrollEventThrottle={16}
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
          onCategorySelect={setSelectedCategory}
          onFilterPress={handleFilterPress}
          isFilterActive={false}
          scrollY={scrollY}
        />

        {ongoingEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={ongoingTitle}
              actionLabel={t("home.viewAll")}
              onAction={handleViewAllOngoing}
            />
            <OngoingEventsCarousel events={ongoingEvents} onEventPress={handleEventPress} />
          </View>
        )}

        {activityEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={activitiesTitle}
              actionLabel={t("home.viewAll")}
              onAction={handleViewAllActivity}
            />
            <View style={styles.activitiesGrid}>
              {activityEvents.slice(0, 4).map((event) => (
                <MediumEventCard
                  key={event.id}
                  event={event}
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
              onAction={handleViewAllUpcoming}
            />
            <UpcomingEventsList events={upcomingEvents} onEventPress={handleEventPress} />
          </View>
        )}


        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.xs,
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
