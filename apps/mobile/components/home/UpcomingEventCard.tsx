import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import { Chip } from "heroui-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { DateBadge } from "./DateBadge";
import type { MockEvent } from "@/data/mock-events";

type UpcomingEventCardProps = {
  event: MockEvent;
  onPress?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  showCountdown?: boolean;
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function getDateParts(timestamp?: number) {
  if (!timestamp) return { day: 0, month: "" };
  const d = new Date(timestamp);
  return { day: d.getDate(), month: MONTH_NAMES[d.getMonth()] ?? "" };
}

function getCountdownLabel(startAt?: number): string | null {
  if (!startAt) return null;
  const diff = startAt - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / HOUR);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(diff / (60 * 1000));
  return `${minutes}m`;
}

function UpcomingEventCardComponent({
  event,
  onPress,
  onBookmark,
  isBookmarked,
  showCountdown = true,
}: UpcomingEventCardProps) {
  const { t } = useTranslation();
  const { flexDirection, textAlign } = useDirection();

  const { day, month } = getDateParts(event.startAt);
  const categoryLabel = event.categories[0]?.toUpperCase() ?? "";
  const priceLabel = event.priceMin ? `$${event.priceMin}` : t("home.freeEntry");
  const countdown = showCountdown ? getCountdownLabel(event.startAt) : null;

  return (
    <Pressable
      onPress={() => onPress?.(event.id)}
      style={styles.card}
    >
      <View style={[styles.row, { flexDirection }]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.images[0] }}
            style={styles.image}
            contentFit="cover"
            transition={120}
          />
          <View style={styles.dateBadge}>
            <DateBadge day={day} month={month} />
          </View>

          {onBookmark && (
            <Pressable
              onPress={() => onBookmark(event.id)}
              style={styles.bookmarkButton}
              hitSlop={8}
            >
              <Fontisto
                name={isBookmarked ? "bookmark-alt" : "bookmark"}
                size={14}
                color="#FFFFFF"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.info}>
          <View style={[styles.topRow, { flexDirection }]}>
            {countdown && (
              <Chip size="sm" variant="secondary" color="accent" animation="disable-all">
                <Chip.Label>{t("bookmarks.startsIn", { time: countdown })}</Chip.Label>
              </Chip>
            )}
            <Text style={styles.price}>{priceLabel}</Text>
          </View>

          <Text style={[styles.title, { textAlign }]} numberOfLines={2}>
            {event.title}
          </Text>

          <Text style={[styles.category, { textAlign }]}>{categoryLabel}</Text>

          <View style={[styles.locationRow, { flexDirection }]}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.location, { textAlign }]} numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const UpcomingEventCard = UpcomingEventCardComponent;

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    padding: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  row: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  imageContainer: {
    width: 104,
    height: 104,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dateBadge: {
    position: "absolute",
    top: 4,
    left: 4,
  },
  bookmarkButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  category: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.semiBold,
    color: "#6366F1",
    letterSpacing: theme.font.letterSpacing.wider,
  },
  price: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  title: {
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  locationRow: {
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 11,
  },
  location: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
    flex: 1,
  },
}));
