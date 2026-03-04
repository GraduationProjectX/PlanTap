import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Button, Tabs } from "heroui-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";

import { BookmarkGridCard } from "@/components/bookmarks/BookmarkGridCard";
import { BookmarkHeroCard } from "@/components/bookmarks/BookmarkHeroCard";
import { BookmarkSectionHeader } from "@/components/bookmarks/BookmarkSectionHeader";
import { isEventLiveNow } from "@/lib/event-formatters";
import type { EventRecord } from "@/lib/events/event-contracts";
import { MOCK_EVENT_COLLECTIONS } from "@/lib/events/event-source";
import { ICON_COLORS, ICON_SIZES } from "@/lib/icon-tokens";
import { useDirection } from "@/rtl";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 12;

const ALL_BOOKMARKED = MOCK_EVENT_COLLECTIONS.all;
const ALL_BOOKMARKED_IDS = new Set(ALL_BOOKMARKED.map((event) => event.id));

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type GroupedEvents = {
  happening: EventRecord[];
  thisWeek: EventRecord[];
  later: EventRecord[];
};

type BookmarkListItem =
  | { id: string; kind: "empty" }
  | { id: string; kind: "header"; title: string; dateRange?: string; isFirstSection: boolean }
  | { id: string; kind: "hero"; event: EventRecord }
  | { id: string; kind: "grid-row"; events: EventRecord[] };

type RenderedSections = {
  items: BookmarkListItem[];
  stickyHeaderIndices: number[];
};

function formatDateRange(events: EventRecord[]): string {
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

function chunkIntoRows(events: EventRecord[], size: number): EventRecord[][] {
  const rows: EventRecord[][] = [];
  for (let index = 0; index < events.length; index += size) {
    rows.push(events.slice(index, index + size));
  }
  return rows;
}

function groupByTimePeriod(events: EventRecord[]): GroupedEvents {
  const now = Date.now();
  const weekAhead = now + 7 * DAY;

  const happening: EventRecord[] = [];
  const thisWeek: EventRecord[] = [];
  const later: EventRecord[] = [];

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
      items.push({ id: `${scope}:happening:${event.id}`, kind: "hero", event });
    }
  }

  if (thisWeek.length > 0) {
    pushHeader(`${scope}:thisWeek:header`, labels.thisWeek, formatDateRange(thisWeek));
    const rows = chunkIntoRows(thisWeek, 2);
    for (const row of rows) {
      items.push({
        id: `${scope}:thisWeek:row:${row.map((event) => event.id).join("-")}`,
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
        id: `${scope}:later:row:${row.map((event) => event.id).join("-")}`,
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
  const { isRTL } = useDirection();

  const [activeTab, setActiveTab] = useState("events");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set(ALL_BOOKMARKED_IDS));

  const bookmarked = ALL_BOOKMARKED.filter((event) => bookmarkedIds.has(event.id));
  const eventItems = bookmarked.filter((event) => event.type === "event");
  const activityItems = bookmarked.filter((event) => event.type === "activity");

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
    router.push(`/event/${id}` as Href);
  };

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBack = () => {
    router.back();
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
          <BookmarkHeroCard
            event={item.event}
            onPress={handleEventPress}
            onBookmark={handleBookmarkToggle}
            isBookmarked={bookmarkedIds.has(item.event.id)}
          />
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.itemInset}>
        <View style={styles.gridRow}>
          {item.events.map((event) => (
            <BookmarkGridCard
              key={event.id}
              event={event}
              onPress={handleEventPress}
              onBookmark={handleBookmarkToggle}
              isBookmarked={bookmarkedIds.has(event.id)}
            />
          ))}
          {item.events.length % 2 !== 0 && <View style={styles.gridSpacer} />}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="secondary" style={styles.tabsRoot}>
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
                size={ICON_SIZES.chevronNav}
                color={ICON_COLORS.chevronOnDark}
              />
            </Button>

            <Text style={styles.topBarTitle}>{t("bookmarks.title")}</Text>

            <View style={styles.iconButtonSpacer} />
          </View>

          <Tabs.List style={styles.tabsList}>
            <Tabs.Indicator style={styles.tabsIndicator} />
            <Tabs.Trigger value="events">
              <Tabs.Label className="text-white font-bold text-lg">{t("bookmarks.events")}</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="activities">
              <Tabs.Label className="text-white font-bold text-lg">{t("bookmarks.activities")}</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
        </View>

        <Tabs.Content value="events" style={styles.tabContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={eventSections.stickyHeaderIndices}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          >
            {eventSections.items.map((item) => renderListItem(item))}
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content value="activities" style={styles.tabContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={activitySections.stickyHeaderIndices}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          >
            {activitySections.items.map((item) => renderListItem(item))}
          </ScrollView>
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
