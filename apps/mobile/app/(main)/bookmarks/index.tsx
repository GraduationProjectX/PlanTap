import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { Button, Tabs } from "heroui-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Fontisto from "@expo/vector-icons/Fontisto";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { UpcomingEventCard } from "@/components/home/UpcomingEventCard";
import { MOCK_EVENTS, type MockEvent } from "@/data/mock-events";
import { useDirection } from "@/rtl";
import { ICON_COLORS, ICON_SIZES } from "@/lib/icon-tokens";

const BOOKMARKED_EVENTS = MOCK_EVENTS.filter((e) => e.startAt && e.startAt > Date.now());
const BOOKMARKED_EVENT_IDS = new Set(BOOKMARKED_EVENTS.map((e) => e.id));

function filterByType(events: MockEvent[], type: "event" | "activity") {
  return events.filter((e) => e.type === type);
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
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    () => new Set(BOOKMARKED_EVENT_IDS),
  );

  const bookmarkedEvents = BOOKMARKED_EVENTS.filter((e) => bookmarkedIds.has(e.id));
  const eventItems = filterByType(bookmarkedEvents, "event");
  const activityItems = filterByType(bookmarkedEvents, "activity");

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

  const renderList = (items: MockEvent[]) => {
    if (items.length === 0) {
      return (
        <EmptyState
          message={t("bookmarks.empty")}
          description={t("bookmarks.emptyDescription")}
        />
      );
    }

    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.listContainer}
      >
        {items.map((event) => (
          <UpcomingEventCard
            key={event.id}
            event={event}
            onPress={handleEventPress}
            onBookmark={handleBookmarkToggle}
            isBookmarked={bookmarkedIds.has(event.id)}
            showCountdown
          />
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
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

      <View style={styles.tabsWrapper}>
        <Tabs value={activeTab} onValueChange={setActiveTab} variant="secondary" style={styles.tabs}>
          <Tabs.List style={styles.tabsList}>
            <Tabs.Indicator />
            <Tabs.Trigger value="events">
              <Tabs.Label>{t("bookmarks.events")}</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="activities">
              <Tabs.Label>{t("bookmarks.activities")}</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          >
            <Tabs.Content value="events">
              {renderList(eventItems)}
            </Tabs.Content>
            <Tabs.Content value="activities">
              {renderList(activityItems)}
            </Tabs.Content>
          </ScrollView>
        </Tabs>
      </View>
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
  tabsWrapper: {
    paddingTop: theme.spacing.md,
  },
  tabs: {
    width: "100%",
  },
  tabsList: {
    alignSelf: "center",
  },
  scrollContent: {
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  listContainer: {
    gap: theme.spacing.sm,
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
