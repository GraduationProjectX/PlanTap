import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { LiveBadge } from "./LiveBadge";
import type { MockEvent } from "@/data/mock-events";

type BigEventCardProps = {
  event: MockEvent;
  onPress?: (id: string) => void;
  width: number;
};

function isLiveNow(event: MockEvent): boolean {
  const now = Date.now();
  return !!(event.startAt && event.endAt && event.startAt <= now && event.endAt > now);
}

function toTagLabel(tag: string): string {
  return tag
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getEventTags(event: MockEvent): string[] {
  const derivedTags = [
    event.indoorOutdoor !== "unknown" ? toTagLabel(event.indoorOutdoor) : null,
    event.familyFriendly ? "For Kids" : null,
  ].filter((tag): tag is string => !!tag);

  const sourceTags = event.tags.map(toTagLabel);
  return Array.from(new Set([...derivedTags, ...sourceTags])).slice(0, 8);
}

function BigEventCardComponent({ event, onPress, width }: BigEventCardProps) {
  const { t } = useTranslation();
  const { textAlign, flexDirection } = useDirection();

  const live = isLiveNow(event);
  const badgeLabel = live ? t("home.liveNow") : null;
  const tagLabels = getEventTags(event);

  return (
      <Pressable
        onPress={() => onPress?.(event.id)}
        style={[styles.card, { width }]}
      >
        <Image
          source={{ uri: event.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={160}
        />
      <View style={styles.overlay} />

      {badgeLabel && (
        <View style={styles.badge}>
          <LiveBadge label={badgeLabel} />
        </View>
      )}

      <View style={styles.content}>
        <View style={[styles.locationRow, { flexDirection }]}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={[styles.locationText, { textAlign }]} numberOfLines={1}>
            {event.location.address}
          </Text>
        </View>
        <View style={[styles.titleRow, { flexDirection }]}>
          <Text style={[styles.title, { textAlign }]} numberOfLines={1}>
            {event.title}
          </Text>
          <View style={styles.arrowButton}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </View>

        {tagLabels.length > 0 && (
          <View style={[styles.tagsContainer, { flexDirection }]}>
            {tagLabels.map((tag) => (
              <View key={`${event.id}-${tag}`} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export const BigEventCard = BigEventCardComponent;

const styles = StyleSheet.create((theme) => ({
  card: {
    height: 240,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  image: {
    ...({ StyleSheet: "absoluteFill" } as any),
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
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    gap: 6,
  },
  locationRow: {
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
  },
  titleRow: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  tagsContainer: {
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#000000",
  },
}));
