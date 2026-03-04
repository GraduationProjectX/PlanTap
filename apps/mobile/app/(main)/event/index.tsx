import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { Button, Select } from "heroui-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { EventCard } from "@/components/events/EventCard";
import { EventListSkeleton } from "@/components/events/EventListSkeleton";
import { FilterButton } from "@/components/ui/FilterButton";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonScreenTransition } from "@/components/ui/SkeletonScreenTransition";
import { useCategories } from "@/hooks/use-categories";
import { useEvents, type EventDoc, type EventCollections } from "@/hooks/use-events";
import { applyEventFilters, isDefaultEventFilters, type FilterType } from "@/lib/event-filters";
import { normalizeEventListType, type EventListType } from "@/lib/event-list-type";
import { buildFilterSummaryTags, removeFilterBySummaryTag } from "@/lib/filter-summary";
import { getCitiesForType } from "@/lib/filters-screen-utils";
import { ICON_COLORS, ICON_SIZES } from "@/lib/icon-tokens";
import { getEventSharedBoundTag } from "@/lib/event-transition";
import { useDirection } from "@/rtl";
import { useEventFiltersStore } from "@/stores/event-filters-store";

const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;
const ALL_CITIES_VALUE = "__all_cities__";

function getEventsForListType(collections: EventCollections | null, type: EventListType): EventDoc[] {
  if (!collections) return [];
  if (type === "ongoing") return collections.ongoing;
  if (type === "upcoming") return collections.upcoming;
  if (type === "activity") return collections.activity;
  return collections.all;
}
const NON_REMOVABLE_FILTER_TAG_IDS = new Set(["type:both", "category:any", "city:all"]);
const FILTER_TYPE_BY_EVENT_LIST_TYPE: Record<EventListType, FilterType> = {
  ongoing: "event",
  upcoming: "event",
  activity: "activity",
  all: "both",
};

function keyExtractor(item: EventDoc) {
  return item._id;
}

export default function ViewAllEventsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cityModalBottomSpacer =
    (Platform.OS === "android" ? Math.max(insets.bottom, 32) : insets.bottom) + 16;
  const { width: screenWidth } = useWindowDimensions();
  const { isRTL, flexDirection, textAlign } = useDirection();
  const appliedFilters = useEventFiltersStore((state) => state.appliedFilters);
  const setAppliedFilters = useEventFiltersStore((state) => state.setAppliedFilters);
  const clearAppliedFilters = useEventFiltersStore((state) => state.clearAppliedFilters);
  const isArabic = i18n.language === "ar";
  const { events: allEvents, collections, isLoading: isEventsLoading } = useEvents();
  const { categories } = useCategories();

  const { type, source, city, homeCategory, category } = useLocalSearchParams<{
    type?: string | string[];
    source?: string | string[];
    city?: string | string[];
    homeCategory?: string | string[];
    category?: string | string[];
  }>();
  const eventType = normalizeEventListType(Array.isArray(type) ? type[0] : type);
  const sourceParam = Array.isArray(source) ? source[0] : source;
  const cityParam = Array.isArray(city) ? city[0] : city;
  const homeCategoryParam = Array.isArray(homeCategory) ? homeCategory[0] : homeCategory;
  const legacyCategoryParam = Array.isArray(category) ? category[0] : category;
  const categoryParam = homeCategoryParam ?? legacyCategoryParam;
  const shouldApplyFilters = sourceParam === "filters";
  const isInitialLoading = isEventsLoading;
  const homeSelectedCategory =
    !shouldApplyFilters && categoryParam && categoryParam !== "all" ? categoryParam : undefined;
  const [searchValue, setSearchValue] = useState("");
  const cityOptions = getCitiesForType(allEvents ?? [], FILTER_TYPE_BY_EVENT_LIST_TYPE[eventType]);
  const initialCity = cityParam && cityOptions.includes(cityParam) ? cityParam : undefined;
  const [selectedCity, setSelectedCity] = useState<string | undefined>(initialCity);
  const allCitiesLabel = t("filters.allCities");
  const selectedCityLabel = selectedCity ?? allCitiesLabel;

  useEffect(() => {
    setSelectedCity(initialCity);
  }, [initialCity]);

  const titlePrefixMap: Record<EventListType, string> = {
    ongoing: t("home.ongoingEventsIn"),
    upcoming: t("home.upcomingIn"),
    activity: t("home.activitiesIn"),
    all: `${t("home.viewAll")} `,
  };

  const events = getEventsForListType(collections, eventType);
  const filteredEvents = shouldApplyFilters ? applyEventFilters(events, appliedFilters) : events;
  const cityScopedEvents =
    !shouldApplyFilters && selectedCity
      ? filteredEvents.filter((event) => event.city === selectedCity)
      : filteredEvents;
  const categoryScopedEvents =
    !shouldApplyFilters && homeSelectedCategory
      ? cityScopedEvents.filter((event) => event.categories.includes(homeSelectedCategory))
      : cityScopedEvents;
  const query = searchValue.trim().toLowerCase();
  const visibleEvents =
    query.length === 0
      ? categoryScopedEvents
      : categoryScopedEvents.filter((event) => {
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
  const cardWidth = (screenWidth - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;
  const filterSummaryTags = buildFilterSummaryTags({
    filters: appliedFilters,
    t: (key) => t(key),
    isArabic,
    categories,
  });
  const visibleFilterSummaryTags = filterSummaryTags.slice(0, 6);
  const hiddenFilterSummaryCount = Math.max(filterSummaryTags.length - visibleFilterSummaryTags.length, 0);
  const showFilterSummary = shouldApplyFilters;
  const showCityEmptyState = selectedCity && query.length === 0 && !homeSelectedCategory;
  const homeCategoryLabel = homeSelectedCategory
    ? (categories.find((item) => item.key === homeSelectedCategory)?.[isArabic ? "labelAr" : "label"] ??
        homeSelectedCategory)
    : null;
  const showHomeCategoryChip = !shouldApplyFilters && !!homeCategoryLabel;

  const handleEventPress = (id: string) => {
    const sharedBoundTag = encodeURIComponent(getEventSharedBoundTag(id));
    router.push(`/event/${id}?sharedBoundTag=${sharedBoundTag}` as Href);
  };

  const handleFilterPress = () => {
    router.push(`/filters?targetType=${eventType}` as Href);
  };

  const handleRemoveFilterTag = (tagId: string) => {
    if (!appliedFilters) {
      return;
    }

    const nextFilters = removeFilterBySummaryTag(appliedFilters, tagId);

    if (isDefaultEventFilters(nextFilters)) {
      clearAppliedFilters();
      return;
    }

    setAppliedFilters(nextFilters);
  };

  const handleBackPress = () => {
    if (shouldApplyFilters) {
      router.replace("/" as Href);
      return;
    }

    router.back();
  };

  const renderItem = ({ item, index }: { item: EventDoc; index: number }) => {
    const isRightColumn = index % 2 !== 0;

    return (
      <View style={[styles.itemCell, isRightColumn && styles.itemCellOffset]}>
        <EventCard event={item} variant="medium" width={cardWidth} onPress={handleEventPress} />
      </View>
    );
  };

  return (
    <SkeletonScreenTransition
      isLoading={isInitialLoading}
      skeleton={
        <EventListSkeleton
          topInset={showHomeCategoryChip ? 112 : 72}
          withFilterSummary={shouldApplyFilters}
        />
      }
    >
      <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}> 
        <Button
          isIconOnly
          feedbackVariant="scale"
          onPress={handleBackPress}
          style={styles.iconButton}
        >
          <FontAwesome
            name={isRTL ? "chevron-right" : "chevron-left"}
            size={ICON_SIZES.chevronNav}
            color={ICON_COLORS.chevronOnDark}
          />
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
          <View style={[styles.titleAndCitySlot, { flexDirection }]}> 
            <Text
              style={[styles.topBarTitle, eventType === "activity" && styles.topBarTitleActivity, { textAlign }]}
              numberOfLines={1}
            >
              {titlePrefixMap[eventType]}
            </Text>
            <Select
              presentation="bottom-sheet"
              value={{
                value: selectedCity ?? ALL_CITIES_VALUE,
                label: selectedCityLabel,
              }}
              onValueChange={(option) => {
                setSelectedCity(option?.value === ALL_CITIES_VALUE ? undefined : option?.value);
              }}
            >
              <Select.Trigger style={styles.citySelectTrigger}>
                <View style={[styles.cityRow, { flexDirection }]}> 
                  <Text style={styles.cityIcon}>📍</Text>
                  <Text style={styles.cityText} numberOfLines={1}>
                    {selectedCityLabel}
                  </Text>
                </View>
                <Select.TriggerIndicator>
                  <FontAwesome
                    name="chevron-down"
                    size={ICON_SIZES.chevronDisclosure}
                    color="rgba(255,255,255,0.84)"
                  />
                </Select.TriggerIndicator>
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
                <Select.Content presentation="bottom-sheet" snapPoints={["65%"]}>
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
                  <View style={{ height: cityModalBottomSpacer }} />
                </Select.Content>
              </Select.Portal>
            </Select>
          </View>
        )}

        {!shouldApplyFilters && <FilterButton onPress={handleFilterPress} isActive={false} />}
      </View>

      {showHomeCategoryChip && (
        <View style={styles.homeContextContainer}>
          <View style={styles.homeCategoryChip}>
            <FontAwesome name="tag" size={12} color="#FFFFFF" />
            <Text style={styles.homeCategoryChipText} numberOfLines={1}>
              {homeCategoryLabel}
            </Text>
          </View>
        </View>
      )}

      {showFilterSummary && (
        <View style={styles.filterMetaContainer}>
          <Text style={styles.resultCountText}>{t("filters.resultsCount", { count: visibleEvents.length })}</Text>
          {visibleFilterSummaryTags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterTagsRow}
            >
              {visibleFilterSummaryTags.map((tag) => {
                if (NON_REMOVABLE_FILTER_TAG_IDS.has(tag.id)) {
                  return (
                    <View key={tag.id} style={styles.filterTag}>
                      <Text style={styles.filterTagText} numberOfLines={1}>
                        {tag.label}
                      </Text>
                    </View>
                  );
                }

                return (
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
                );
              })}
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

      <FlashList
        data={visibleEvents}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={2}
        getItemType={() => "event-grid-card"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        drawDistance={900}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome
              name={showCityEmptyState ? "map-marker" : "calendar-times-o"}
              size={42}
              color={"gray"}
            />
            <Text style={styles.noResultText}>
              {showCityEmptyState
                ? t("home.noEventsInCity", { city: selectedCity })
                : t("home.noResultsFound")}
            </Text>
            {showCityEmptyState && (
              <Text style={styles.emptyHintText}>{t("home.tryAnotherCity")}</Text>
            )}
          </View>
        }
      />
      </View>
    </SkeletonScreenTransition>
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
  homeContextContainer: {
    paddingTop: theme.spacing.sm,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 4,
  },
  homeCategoryChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 7,
    maxWidth: "100%",
  },
  homeCategoryChipText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
    color: "#FFF",
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
    fontSize: 14,
    fontFamily: theme.font.family.bold,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  topBarTitleActivity: {
    fontSize: 15,
  },
  titleAndCitySlot: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  citySelectTrigger: {
    borderRadius: 999,
    borderCurve: "continuous",
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  cityRow: {
    alignItems: "center",
    gap: 6,
  },
  cityText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  cityIcon: {
    fontSize: 14,
  },
  cityOverlay: {
    backgroundColor: "rgba(10, 14, 24, 0.68)",
  },
  cityOptionInner: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cityOptionIcon: {
    fontSize: 18,
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
  itemCell: {
    width: "50%",
  },
  itemCellOffset: {
    paddingLeft: COLUMN_GAP,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultText: {
    marginTop: 14,
    fontSize: theme.font.size.xl,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontFamily: theme.font.family.bold,
  },
  emptyHintText: {
    marginTop: 8,
    fontSize: theme.font.size.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    fontFamily: theme.font.family.medium,
  },
}));
