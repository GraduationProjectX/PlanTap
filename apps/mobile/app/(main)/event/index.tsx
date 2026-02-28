import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Button } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { MediumEventCard } from "@/components/home/MediumEventCard";
import { FilterButton } from "@/components/ui/FilterButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { applyEventFilters, isDefaultEventFilters } from "@/lib/event-filters";
import { normalizeEventListType, type EventListType } from "@/lib/event-list-type";
import { buildFilterSummaryTags, removeFilterBySummaryTag } from "@/lib/filter-summary";
import {
  MOCK_EVENTS,
  ONGOING_EVENTS,
  RECOMMENDED_EVENTS,
  UPCOMING_EVENTS,
  type MockEvent,
} from "@/data/mock-events";
import { useDirection } from "@/rtl";
import { useEventFiltersStore } from "@/stores/event-filters-store";

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;

function keyExtractor(item: MockEvent) {
  return item.id;
}

export default function ViewAllEventsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { isRTL } = useDirection();
  const appliedFilters = useEventFiltersStore((state) => state.appliedFilters);
  const setAppliedFilters = useEventFiltersStore((state) => state.setAppliedFilters);
  const clearAppliedFilters = useEventFiltersStore((state) => state.clearAppliedFilters);
  const isArabic = i18n.language === "ar";
  const [searchValue, setSearchValue] = useState("");

  const { type, source } = useLocalSearchParams<{
    type?: string | string[];
    source?: string | string[];
  }>();
  const eventType = normalizeEventListType(Array.isArray(type) ? type[0] : type);
  const sourceParam = Array.isArray(source) ? source[0] : source;
  const shouldApplyFilters = sourceParam === "filters";

  const dataMap: Record<EventListType, MockEvent[]> = {
    ongoing: ONGOING_EVENTS,
    upcoming: UPCOMING_EVENTS,
    recommended: RECOMMENDED_EVENTS,
    all: MOCK_EVENTS,
  };

  const titleMap: Record<EventListType, string> = {
    ongoing: t("home.ongoingEvents"),
    upcoming: t("home.upcoming"),
    recommended: t("home.recommended"),
    all: t("home.viewAll"),
  };

  const events = dataMap[eventType];
  const filteredEvents = shouldApplyFilters ? applyEventFilters(events, appliedFilters) : events;
  const query = searchValue.trim().toLowerCase();
  const visibleEvents =
    query.length === 0
      ? filteredEvents
      : filteredEvents.filter((event) => {
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
        });
  const title = titleMap[eventType];
  const cardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;
  const filterSummaryTags = buildFilterSummaryTags({
    filters: appliedFilters,
    t: (key) => t(key),
    isArabic,
  });
  const visibleFilterSummaryTags = filterSummaryTags.slice(0, 6);
  const hiddenFilterSummaryCount = Math.max(filterSummaryTags.length - visibleFilterSummaryTags.length, 0);
  const showFilterSummary = shouldApplyFilters;

  function handleEventPress(id: string) {
    router.push(`/event/${id}` as Href);
  }

  function handleFilterPress() {
    router.push(`/filters?targetType=${eventType}` as Href);
  }

  function handleRemoveFilterTag(tagId: string) {
    if (!appliedFilters) {
      return;
    }

    const nextFilters = removeFilterBySummaryTag(appliedFilters, tagId);

    if (isDefaultEventFilters(nextFilters)) {
      clearAppliedFilters();
      return;
    }

    setAppliedFilters(nextFilters);
  }

  function handleBackPress() {
    if (shouldApplyFilters) {
      router.replace("/" as Href);
      return;
    }

    router.back();
  }

  function renderItem({ item }: { item: MockEvent }) {
    return <MediumEventCard event={item} width={cardWidth} onPress={handleEventPress} />;
  }

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}> 
        <Button
          isIconOnly
          feedbackVariant="scale"
          onPress={handleBackPress}
          style={styles.iconButton}
        >
          <FontAwesome name={isRTL ? "chevron-right" : "chevron-left"} size={14} color="#FFFFFF" />
        </Button>

        {shouldApplyFilters ? (
          <View style={styles.searchSlot}>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              placeholder={t("home.search")}
              onFilterPress={handleFilterPress}
              isFilterActive={!!appliedFilters}
              withHorizontalPadding={false}
            />
          </View>
        ) : (
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {title}
          </Text>
        )}

        {!shouldApplyFilters && <FilterButton onPress={handleFilterPress} isActive={false} />}
      </View>

      {showFilterSummary && (
        <View style={styles.filterMetaContainer}>
          <Text style={styles.resultCountText}>{t("filters.resultsCount", { count: visibleEvents.length })}</Text>
          {visibleFilterSummaryTags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterTagsRow}
            >
              {visibleFilterSummaryTags.map((tag) => (
                <Pressable
                  key={tag.id}
                  onPress={() => handleRemoveFilterTag(tag.id)}
                  style={styles.filterTag}
                  accessibilityRole="button"
                  accessibilityLabel={t("filters.removeFilter")}
                >
                  <Text style={styles.filterTagText} numberOfLines={1}>
                    {tag.label}
                  </Text>
                  <FontAwesome name="times" size={12} color="#FFF" />
                </Pressable>
              ))}
              {hiddenFilterSummaryCount > 0 && (
                <View style={styles.filterTag}>
                  <Text style={styles.filterTagText}>+{hiddenFilterSummaryCount}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {showFilterSummary && <View style={styles.summarySeparator} />}

      <FlatList
        data={visibleEvents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.headerBackground,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  searchSlot: {
    flex: 1,
  },
  filterMetaContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: theme.spacing.xs,
  },
  summarySeparator: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: HORIZONTAL_PADDING,
  },
  resultCountText: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
  filterTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingRight: 4,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 220,
  },
  filterTagText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: "#FFF",
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: "#FFFFFF",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingTop: theme.spacing.md,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  row: {
    gap: COLUMN_GAP,
  },
}));
