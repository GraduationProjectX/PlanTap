import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { MockEvent } from "@/data/mock-events";

type BookmarkGridCardProps = {
  event: MockEvent;
  onPress?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
};

function getShortDateLabel(timestamp?: number): string {
  if (!timestamp) return "";
  const d = new Date(timestamp);
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

function BookmarkGridCardComponent({
  event,
  onPress,
  onBookmark,
  isBookmarked,
}: BookmarkGridCardProps) {
  const dateLabel = getShortDateLabel(event.startAt);

  return (
    <Pressable onPress={() => onPress?.(event.id)} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={120}
        />
        <View style={styles.overlay} />

        {onBookmark && (
          <Pressable
            onPress={() => onBookmark(event.id)}
            style={styles.heartButton}
            hitSlop={8}
          >
            <FontAwesome
              name={isBookmarked ? "heart" : "heart-o"}
              size={14}
              color="#FFFFFF"
            />
          </Pressable>
        )}

        {!!dateLabel && (
          <View style={styles.dateBadge}>
            <FontAwesome name="calendar-o" size={11} color="#FFFFFF" />
            <Text style={styles.dateText} numberOfLines={1}>
              {dateLabel}
            </Text>
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const BookmarkGridCard = BookmarkGridCardComponent;

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
  },
  imageContainer: {
    aspectRatio: 0.9,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    position: "relative",
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.xs,
    fontFamily: theme.font.family.semiBold,
    letterSpacing: theme.font.letterSpacing.wide,
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
  },
}));
