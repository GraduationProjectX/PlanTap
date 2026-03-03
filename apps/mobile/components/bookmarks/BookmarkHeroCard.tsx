import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { LiveBadge } from "@/components/home/LiveBadge";
import type { MockEvent } from "@/data/mock-events";

type BookmarkHeroCardProps = {
  event: MockEvent;
  onPress?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
};

const HOUR = 60 * 60 * 1000;
function isLiveNow(event: MockEvent): boolean {
  const now = Date.now();
  return !!(event.startAt != null && event.endAt != null && event.startAt <= now && event.endAt > now);
}

function getStartDateLabel(startAt?: number): string | null {
  if (!startAt) return null;
  const d = new Date(startAt);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, "0");
  return `${month}/${day}/${year} • ${h}:${m} ${ampm}`;
}

function getRemainingLabel(endAt?: number): string | null {
  if (!endAt) return null;
  const diff = endAt - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / HOUR);
  const minutes = Math.floor((diff % HOUR) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function BookmarkHeroCardComponent({
  event,
  onPress,
  onBookmark,
  isBookmarked,
}: BookmarkHeroCardProps) {
  const { t } = useTranslation();
  const { flexDirection, textAlign, isRTL } = useDirection();

  const live = event.type !== "activity" && isLiveNow(event);
  const dateLabel = event.startAt ? getStartDateLabel(event.startAt) : event.type === "activity" ? t("filters.whenAll") : null;
  const remaining = live ? getRemainingLabel(event.endAt) : null;
  const badgeLabel = t("home.liveNow");

  return (
    <Pressable onPress={() => onPress?.(event.id)} style={styles.card}>
      <Image
        source={{ uri: event.images[0] }}
        style={styles.image}
        contentFit="cover"
        transition={160}
      />
      <View style={styles.overlay} />

      <View style={[styles.topRow, { flexDirection }]}>
        {onBookmark && (
          <Pressable
            onPress={() => onBookmark(event.id)}
            style={styles.heartButton}
            hitSlop={8}
          >
            <FontAwesome
              name={isBookmarked ? "heart" : "heart-o"}
              size={16}
              color="#FFFFFF"
            />
          </Pressable>
        )}
        <View style={styles.topSpacer} />
        <View
          style={[styles.topBadges, { alignItems: isRTL ? "flex-start" : "flex-end" }]}
        >
          {dateLabel && (
            <View style={styles.dateBadge}>
              <FontAwesome name="calendar-o" size={11} color="#FFFFFF" />
              <Text style={styles.dateText}>{dateLabel}</Text>
            </View>
          )}
          {remaining && (
            <View style={styles.remainingBadge}>
              <FontAwesome name="clock-o" size={11} color="#FFFFFF" />
              <Text style={styles.remainingText}>
                {t("bookmarks.remaining", { time: remaining })}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {live && (
          <View style={styles.badge}>
            <LiveBadge label={badgeLabel} />
          </View>
        )}
        <Text style={[styles.title, { textAlign }]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={[styles.locationRow, { flexDirection }]}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={[styles.locationText, { textAlign }]} numberOfLines={1}>
            {event.location.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export const BookmarkHeroCard = BookmarkHeroCardComponent;

const styles = StyleSheet.create((theme) => ({
  card: {
    height: 220,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    // marginBottom: theme.spacing.xs,
    // backgroundColor: "red",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  topRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    alignItems: "flex-start",
  },
  topSpacer: {
    flex: 1,
  },
  topBadges: {
    gap: 6,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
    letterSpacing: theme.font.letterSpacing.wide,
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  remainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  remainingText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
  },
  badge: {
    alignSelf: "flex-start",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    gap: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
  },
  locationRow: {
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
}));
