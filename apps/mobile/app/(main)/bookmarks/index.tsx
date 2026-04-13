import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button, Tabs } from "heroui-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";

import { EventCard } from "@/components/events/EventCard";
import { BookmarksSkeleton } from "@/components/bookmarks/BookmarksSkeleton";
import { BookmarkSectionHeader } from "@/components/bookmarks/BookmarkSectionHeader";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { EventDoc } from "@/hooks/use-events";
import { isEventLiveNow } from "@/features/events/data";
import { useDirection } from "@/rtl";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 12;
const CONTENT_SKELETON_TOP_INSET = 16;

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type GroupedEvents = {
  happening: EventDoc[];
  thisWeek: EventDoc[];
  later: EventDoc[];
};

type BookmarkListItem =
  | { id: string; kind: "empty" }
  | { id: string; kind: "header"; title: string; dateRange?: string; isFirstSection: boolean }
  | { id: string; kind: "hero"; event: EventDoc }
  | { id: string; kind: "grid-row"; events: EventDoc[] };

type RenderedSections = {
  items: BookmarkListItem[];
  stickyHeaderIndices: number[];
};

function formatDateRange(events: EventDoc[]): string {
  if (events.length === 0) return "";

  const timestamps = events
    .map((event) => event.startAt)
    .filter((value): value is number => value != null)
    .sort((left, right) => left - right);

  if (timestamps.length === 0) return "";

  const first = new Date(timestamps[0]!);
  const last = new Date(timestamps[timestamps.length - 1]!);
  const firstMonth = MONTH_SHORT[first.getMonth()]!.toUpperCase();

  if (first.getDate() === last.getDate() && first.getMonth() === last.getMonth()) {
    return `${firstMonth} ${first.getDate()}`;
  }

  if (first.getMonth() === last.getMonth()) {
    return `${firstMonth} ${first.getDate()} - ${last.getDate()}`;
  }

  const lastMonth = MONTH_SHORT[last.getMonth()]!.toUpperCase();
  return `${firstMonth} ${first.getDate()} - ${lastMonth} ${last.getDate()}`;
}

function chunkIntoRows(events: EventDoc[], size: number): EventDoc[][] {
  const rows: EventDoc[][] = [];
  for (let index = 0; index < events.length; index += size) {
    rows.push(events.slice(index, index + size));
  }
  return rows;
}

function groupByTimePeriod(events: EventDoc[]): GroupedEvents {
  const now = Date.now();
  const weekAhead = now + 7 * DAY;

  const happening: EventDoc[] = [];
  const thisWeek: EventDoc[] = [];
  const later: EventDoc[] = [];

  for (const event of events) {
    if (event.type === "activity" && event.startAt == null && event.endAt == null) {
      happening.push(event);
      continue;
    }

    if (isEventLiveNow(event)) {
      happening.push(event);
      continue;
    }

    if (event.startAt != null && event.startAt > now && event.startAt <= weekAhead) {
      thisWeek.push(event);
      continue;
    }

    if (event.startAt != null && event.startAt > weekAhead) {
      later.push(event);
    }
  }

  thisWeek.sort((left, right) => (left.startAt ?? 0) - (right.startAt ?? 0));
  later.sort((left, right) => (left.startAt ?? 0) - (right.startAt ?? 0));

  return { happening, thisWeek, later };
}

function buildRenderedSections(
  groups: GroupedEvents,
  labels: { happening: string; thisWeek: string; later: string },
  scope: string,
): RenderedSections {
  const { happening, thisWeek, later } = groups;
  const isEmpty = happening.length === 0 && thisWeek.length === 0 && later.length === 0;

  if (isEmpty) {
    return {
      items: [{ id: `${scope}:empty`, kind: "empty" }],
      stickyHeaderIndices: [],
    };
  }

  const items: BookmarkListItem[] = [];
  const stickyHeaderIndices: number[] = [];
  let sectionsCount = 0;

  const pushHeader = (id: string, title: string, dateRange?: string) => {
    stickyHeaderIndices.push(items.length);
    items.push({
      id,
      kind: "header",
      title,
      dateRange,
      isFirstSection: sectionsCount === 0,
    });
    sectionsCount += 1;
  };

  if (happening.length > 0) {
    pushHeader(`${scope}:happening:header`, labels.happening);
    for (const event of happening) {
      items.push({ id: `${scope}:happening:${event._id}`, kind: "hero", event });
    }
  }

  if (thisWeek.length > 0) {
    pushHeader(`${scope}:thisWeek:header`, labels.thisWeek, formatDateRange(thisWeek));
    const rows = chunkIntoRows(thisWeek, 2);
    for (const row of rows) {
      items.push({
        id: `${scope}:thisWeek:row:${row.map((event) => event._id).join("-")}`,
        kind: "grid-row",
        events: row,
      });
    }
  }

  if (later.length > 0) {
    pushHeader(`${scope}:later:header`, labels.later, formatDateRange(later));
    const rows = chunkIntoRows(later, 2);
    for (const row of rows) {
      items.push({
        id: `${scope}:later:row:${row.map((event) => event._id).join("-")}`,
        kind: "grid-row",
        events: row,
      });
    }
  }

  return { items, stickyHeaderIndices };
}

function EmptyState({ message, description }: { message: string; description: string }) {
  return (
    <View style={emptyStyles.container}>
      <Fontisto name="bookmark" size={48} color="#A3A3A3" />
      <Text style={emptyStyles.title}>{message}</Text>
      <Text style={emptyStyles.description}>{description}</Text>
    </View>
  );
}

export default function BookmarksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { isRTL } = useDirection();

  const [activeTab, setActiveTab] = useState("events");
  const { bookmarkedEvents, bookmarkedIds, toggleBookmark, isLoading } = useBookmarks();

  const eventItems = bookmarkedEvents.filter((event) => event.type === "event");
  const activityItems = bookmarkedEvents.filter((event) => event.type === "activity");

  const eventSections = buildRenderedSections(
    groupByTimePeriod(eventItems),
    {
      happening: t("bookmarks.happeningNow"),
      thisWeek: t("bookmarks.thisWeek"),
      later: t("bookmarks.later"),
    },
    "events",
  );
  const activitySections = buildRenderedSections(
    groupByTimePeriod(activityItems),
    {
      happening: t("bookmarks.availableNow"),
      thisWeek: t("bookmarks.thisWeek"),
      later: t("bookmarks.later"),
    },
    "activities",
  );

  const handleEventPress = (id: string) => {
    router.push({ pathname: "/event/[id]", params: { id } });
  };

  const handleBookmarkToggle = (id: EventDoc["_id"]) => {
    toggleBookmark(id);
  };

  const handleBack = () => {
    router.back();
  };

  const renderTabContent = (sections: RenderedSections) => {
    if (isLoading) {
      return <BookmarksSkeleton topInset={CONTENT_SKELETON_TOP_INSET} />;
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={sections.stickyHeaderIndices}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {sections.items.map((item) => renderListItem(item))}
      </ScrollView>
    );
  };

  const renderListItem = (item: BookmarkListItem) => {
    if (item.kind === "empty") {
      return (
        <View key={item.id} style={styles.itemInset}>
          <EmptyState
            message={t("bookmarks.empty")}
            description={t("bookmarks.emptyDescription")}
          />
        </View>
      );
    }

    if (item.kind === "header") {
      return (
        <View
          key={item.id}
          style={[
            styles.stickyHeader,
            styles.itemInset,
            !item.isFirstSection && styles.stickyHeaderSpaced,
          ]}
        >
          <BookmarkSectionHeader title={item.title} dateRange={item.dateRange} />
        </View>
      );
    }

    if (item.kind === "hero") {
      return (
        <View key={item.id} style={[styles.itemInset, styles.heroItem]}>
          <EventCard
            event={item.event}
            variant="bookmark-hero"
            onPress={handleEventPress}
            onBookmark={handleBookmarkToggle}
            isBookmarked={bookmarkedIds.has(item.event._id)}
          />
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.itemInset}>
        <View style={styles.gridRow}>
          {item.events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              variant="bookmark-grid"
              onPress={handleEventPress}
              onBookmark={handleBookmarkToggle}
              isBookmarked={bookmarkedIds.has(event._id)}
            />
          ))}
          {item.events.length % 2 !== 0 && <View style={styles.gridSpacer} />}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        variant="secondary"
        style={styles.tabsRoot}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.titleRow}>
            <Button
              isIconOnly
              feedbackVariant="scale"
              onPress={handleBack}
              style={styles.iconButton}
            >
              <FontAwesome
                name={isRTL ? "chevron-right" : "chevron-left"}
                size={theme.icon.sm}
                color={theme.colors.headerForeground}
              />
            </Button>

            <Text style={styles.topBarTitle}>{t("bookmarks.title")}</Text>

            <View style={styles.iconButtonSpacer} />
          </View>

          <Tabs.List style={styles.tabsList}>
            <Tabs.Indicator style={styles.tabsIndicator} />
            <Tabs.Trigger value="events">
              <Tabs.Label className="text-white font-bold text-lg">
                {t("bookmarks.events")}
              </Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="activities">
              <Tabs.Label className="text-white font-bold text-lg">
                {t("bookmarks.activities")}
              </Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
        </View>

        <Tabs.Content value="events" style={styles.tabContent}>
          {renderTabContent(eventSections)}
        </Tabs.Content>

        <Tabs.Content value="activities" style={styles.tabContent}>
          {renderTabContent(activitySections)}
        </Tabs.Content>
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    backgroundColor: theme.colors.headerBackground,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
  iconButtonSpacer: {
    width: 40,
  },
  tabsRoot: {
    flex: 1,
  },
  tabsList: {
    width: "100%",
    paddingHorizontal: theme.spacing.xl,
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
    borderWidth: 0,
    borderBottomWidth: 0,
  },
  tabsIndicator: {
    backgroundColor: "#000000",
    borderRadius: theme.radius.full,
    height: 3,
  },
  tabContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
  },
  itemInset: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  stickyHeader: {
    backgroundColor: theme.colors.background,
    zIndex: 1,
  },
  stickyHeaderSpaced: {
    marginTop: theme.spacing.lg,
  },
  heroItem: {
    marginTop: theme.spacing.xs,
  },
  gridRow: {
    marginTop: theme.spacing.xs,
    flexDirection: "row",
    gap: GRID_GAP,
  },
  gridSpacer: {
    flex: 1,
  },
}));

const emptyStyles = StyleSheet.create((theme) => ({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  description: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
}));
