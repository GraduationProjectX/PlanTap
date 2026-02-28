import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import { HomeHeaderSticky, HomeHeaderTop } from "@/components/home/HomeHeader";
import { SectionHeader } from "@/components/home/SectionHeader";
import { OngoingEventsCarousel } from "@/components/home/OngoingEventsCarousel";
import { UpcomingEventsList } from "@/components/home/UpcomingEventsList";
import { RecommendedGrid } from "@/components/home/RecommendedGrid";
import { ONGOING_EVENTS, UPCOMING_EVENTS, RECOMMENDED_EVENTS } from "@/data/mock-events";

type ViewAllEventType = "ongoing" | "upcoming" | "recommended" | "all";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  function handleEventPress(id: string) {
    router.push(`/event/${id}`);
  }

  function handleFavorite(_id: string) {
    // TODO: wire up favorites toggle via Convex
  }

  function handleViewAll(type: ViewAllEventType) {
    router.push(`/event?type=${type}` as Href);
  }

  const ongoingEvents = ONGOING_EVENTS;
  const upcomingEvents = UPCOMING_EVENTS;
  const recommendedEvents = RECOMMENDED_EVENTS;

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
        <HomeHeaderTop city="Riyadh" onFavoritePress={() => {}} onLocationPress={() => {}} />
        <HomeHeaderSticky
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onFilterPress={() => router.push("/filters?targetType=all" as Href)}
          isFilterActive={false}
          scrollY={scrollY}
        />

        {ongoingEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t("home.ongoingEvents")}
              actionLabel={t("home.viewAll")}
              onAction={() => handleViewAll("ongoing")}
            />
            <OngoingEventsCarousel events={ongoingEvents} onEventPress={handleEventPress} />
          </View>
        )}

        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t("home.upcoming")}
              actionLabel={t("home.viewAll")}
              onAction={() => handleViewAll("upcoming")}
            />
            <UpcomingEventsList events={upcomingEvents} onEventPress={handleEventPress} />
          </View>
        )}

        {recommendedEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t("home.recommended")}
              actionLabel={t("home.viewAll")}
              onAction={() => handleViewAll("recommended")}
            />
            <RecommendedGrid
              events={recommendedEvents}
              onEventPress={handleEventPress}
              onFavorite={handleFavorite}
            />
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
  bottomSpacer: {
    height: theme.spacing.xl,
  },
}));
