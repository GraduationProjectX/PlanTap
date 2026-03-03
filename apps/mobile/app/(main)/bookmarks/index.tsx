import { useState, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Button, Tabs } from "heroui-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";

import { BookmarkHeroCard } from "@/components/bookmarks/BookmarkHeroCard";
import { BookmarkGridCard } from "@/components/bookmarks/BookmarkGridCard";
import { BookmarkSectionHeader } from "@/components/bookmarks/BookmarkSectionHeader";
import { MOCK_EVENTS, type MockEvent } from "@/data/mock-events";
import { useDirection } from "@/rtl";
import { ICON_COLORS, ICON_SIZES } from "@/lib/icon-tokens";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const HORIZONTAL_PADDING = 16;
const GRID_GAP = 12;

const ALL_BOOKMARKED = MOCK_EVENTS;
const ALL_BOOKMARKED_IDS = new Set(ALL_BOOKMARKED.map((e) => e.id));

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateRange(events: MockEvent[]): string {
  if (events.length === 0) return "";
  const timestamps = events
    .map((e) => e.startAt)
    .filter((t): t is number => t != null)
    .sort((a, b) => a - b);
  if (timestamps.length === 0) return "";

  const first = new Date(timestamps[0]!);
  const last = new Date(timestamps[timestamps.length - 1]!);
  const m1 = MONTH_SHORT[first.getMonth()]!.toUpperCase();

  if (first.getDate() === last.getDate() && first.getMonth() === last.getMonth()) {
    return `${m1} ${first.getDate()}`;
  }

  if (first.getMonth() === last.getMonth()) {
    return `${m1} ${first.getDate()} – ${last.getDate()}`;
  }

  const m2 = MONTH_SHORT[last.getMonth()]!.toUpperCase();
  return `${m1} ${first.getDate()} – ${m2} ${last.getDate()}`;
}

type GroupedEvents = {
  happening: MockEvent[];
  thisWeek: MockEvent[];
  later: MockEvent[];
};

type RenderedSections = {
  content: ReactNode;
  stickyHeaderIndices?: number[];
};

function groupByTimePeriod(events: MockEvent[]): GroupedEvents {
  const now = Date.now();
  const weekAhead = now + 7 * DAY;

  const happening: MockEvent[] = [];
  const thisWeek: MockEvent[] = [];
  const later: MockEvent[] = [];

  for (const e of events) {
    if (e.type === "activity" && e.startAt == null && e.endAt == null) {
      happening.push(e);
      continue;
    }

    const isOngoing = e.startAt != null && e.endAt != null && e.startAt <= now && e.endAt > now;
    if (isOngoing) {
      happening.push(e);
    } else if (e.startAt != null && e.startAt > now && e.startAt <= weekAhead) {
      thisWeek.push(e);
    } else if (e.startAt != null && e.startAt > weekAhead) {
      later.push(e);
    }
  }

  thisWeek.sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));
  later.sort((a, b) => (a.startAt ?? 0) - (b.startAt ?? 0));

  return { happening, thisWeek, later };
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

function GridRow({ events, onPress, onBookmark, bookmarkedIds }: {
  events: MockEvent[];
  onPress: (id: string) => void;
  onBookmark: (id: string) => void;
  bookmarkedIds: Set<string>;
}) {
  return (
    <View style={styles.gridRow}>
      {events.map((event) => (
        <BookmarkGridCard
          key={event.id}
          event={event}
          onPress={onPress}
          onBookmark={onBookmark}
          isBookmarked={bookmarkedIds.has(event.id)}
        />
      ))}
      {events.length % 2 !== 0 && <View style={styles.gridSpacer} />}
    </View>
  );
}

function EventGrid({ events, onPress, onBookmark, bookmarkedIds }: {
  events: MockEvent[];
  onPress: (id: string) => void;
  onBookmark: (id: string) => void;
  bookmarkedIds: Set<string>;
}) {
  const rows: MockEvent[][] = [];
  for (let i = 0; i < events.length; i += 2) {
    rows.push(events.slice(i, i + 2));
  }

  return (
    <View style={styles.gridContainer}>
      {rows.map((row) => (
        <GridRow
          key={row.map((e) => e.id).join("-")}
          events={row}
          onPress={onPress}
          onBookmark={onBookmark}
          bookmarkedIds={bookmarkedIds}
        />
      ))}
    </View>
  );
}

export default function BookmarksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isRTL } = useDirection();

  const [activeTab, setActiveTab] = useState("events");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => new Set(ALL_BOOKMARKED_IDS),
  );

  const bookmarked = ALL_BOOKMARKED.filter((e) => bookmarkedIds.has(e.id));
  const eventItems = bookmarked.filter((e) => e.type === "event");
  const activityItems = bookmarked.filter((e) => e.type === "activity");

  const eventGroups = groupByTimePeriod(eventItems);
  const activityGroups = groupByTimePeriod(activityItems);

  const handleEventPress = (id: string) => {
    router.push(`/event/${id}` as Href);
  };

  const handleBookmarkToggle = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
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

  const renderSections = (groups: GroupedEvents, happeningTitle: string): RenderedSections => {
    const { happening, thisWeek, later } = groups;
    const isEmpty = happening.length === 0 && thisWeek.length === 0 && later.length === 0;

    if (isEmpty) {
      return {
        content: (
          <EmptyState
            message={t("bookmarks.empty")}
            description={t("bookmarks.emptyDescription")}
          />
        ),
      };
    }

    const nodes: ReactNode[] = [];
    const stickyHeaderIndices: number[] = [];

    if (happening.length > 0) {
      stickyHeaderIndices.push(nodes.length);
      nodes.push(
        <View key="happening-header" style={styles.stickyHeader}>
          <BookmarkSectionHeader title={happeningTitle} />
        </View>,
      );
      nodes.push(
        <View key="happening-body" style={styles.sectionBody}>
          {happening.map((event) => (
            <BookmarkHeroCard
              key={event.id}
              event={event}
              onPress={handleEventPress}
              onBookmark={handleBookmarkToggle}
              isBookmarked={bookmarkedIds.has(event.id)}
            />
          ))}
        </View>,
      );
    }

    if (thisWeek.length > 0) {
      stickyHeaderIndices.push(nodes.length);
      nodes.push(
        <View key="this-week-header" style={styles.stickyHeader}>
          <BookmarkSectionHeader
            title={t("bookmarks.thisWeek")}
            dateRange={formatDateRange(thisWeek)}
          />
        </View>,
      );
      nodes.push(
        <View key="this-week-body" style={styles.sectionBody}>
          <EventGrid
            events={thisWeek}
            onPress={handleEventPress}
            onBookmark={handleBookmarkToggle}
            bookmarkedIds={bookmarkedIds}
          />
        </View>,
      );
    }

    if (later.length > 0) {
      stickyHeaderIndices.push(nodes.length);
      nodes.push(
        <View key="later-header" style={styles.stickyHeader}>
          <BookmarkSectionHeader
            title={t("bookmarks.later")}
            dateRange={formatDateRange(later)}
          />
        </View>,
      );
      nodes.push(
        <View key="later-body" style={styles.sectionBody}>
          <EventGrid
            events={later}
            onPress={handleEventPress}
            onBookmark={handleBookmarkToggle}
            bookmarkedIds={bookmarkedIds}
          />
        </View>,
      );
    }

    return { content: nodes, stickyHeaderIndices };
  };

  const eventSections = renderSections(eventGroups, t("bookmarks.happeningNow"));
  const activitySections = renderSections(activityGroups, t("bookmarks.availableNow"));

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
            {eventSections.content}
          </ScrollView>
        </Tabs.Content>
        <Tabs.Content value="activities" style={styles.tabContent}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            stickyHeaderIndices={activitySections.stickyHeaderIndices}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          >
            {activitySections.content}
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
    justifyContent: "center",
    alignContent: "center",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: theme.spacing.lg,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  stickyHeader: {
    backgroundColor: theme.colors.background,
    zIndex: 1,
  },
  sectionBody: {
    paddingTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  gridContainer: {
    gap: GRID_GAP,
  },
  gridRow: {
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
