import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image } from "expo-image";
import { Button, Card, Chip, PressableFeedback } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { MockEvent } from "@/data/mock-events";
import { useDirection } from "@/rtl";

import { LiveBadge } from "./LiveBadge";

type MediumEventCardProps = {
  event: MockEvent;
  width: number;
  onPress?: (id: string) => void;
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
  return Array.from(new Set([...derivedTags, ...sourceTags])).slice(0, 5);
}

export function MediumEventCard({ event, width, onPress }: MediumEventCardProps) {
  const { t } = useTranslation();
  const { isRTL, flexDirection, textAlign } = useDirection();

  const live = isLiveNow(event);
  const badgeLabel = live ? t("home.liveNow") : null;
  const tagLabels = getEventTags(event);

  function handlePress() {
    onPress?.(event.id);
  }

  return (
    <PressableFeedback
      onPress={handlePress}
      style={[styles.container, { width }]}
      animation={{ scale: { value: 0.985 } }}
    >
      <Card style={styles.card} animation="disable-all" variant="transparent">
        <Image
          source={{ uri: event.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={250}
        />
        <View style={styles.overlay} />

        {badgeLabel && (
          <View style={styles.badge}>
            <LiveBadge label={badgeLabel} />
          </View>
        )}

        <Card.Body style={styles.content}>
          <View style={[styles.locationRow, { flexDirection }]}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.locationText, { textAlign }]} numberOfLines={1}>
              {event.location.address ?? event.city}
            </Text>
          </View>

          <View style={[styles.titleRow, { flexDirection }]}>
            <Text style={[styles.title, { textAlign }]} numberOfLines={3}>
              {event.title}
            </Text>

            <Button
              isIconOnly
              onPress={handlePress}
              feedbackVariant="scale"
              style={styles.arrowButton}
            >
              <FontAwesome name={isRTL ? "arrow-left" : "arrow-right"} size={12} color="#000000" />
            </Button>
          </View>

          {tagLabels.length > 0 && (
            <View style={[styles.tagsContainer, { flexDirection }]}>
              {tagLabels.map((tag) => (
                <Chip
                  key={`${event.id}-${tag}`}
                  size="sm"
                  variant="soft"
                  color="default"
                  animation="disable-all"
                  style={styles.tagChip}
                >
                  <Chip.Label style={styles.tagText}>{tag}</Chip.Label>
                </Chip>
              ))}
            </View>
          )}
        </Card.Body>
      </Card>
    </PressableFeedback>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    height: 254,
    marginBottom: theme.spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.16)",
  },
  image: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  content: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 6,
  },
  locationRow: {
    alignItems: "center",
    gap: 4,
  },
  locationIcon: {
    fontSize: 11,
  },
  locationText: {
    flex: 1,
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
  },
  titleRow: {
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    flexWrap: "wrap",
    color: "#FFFFFF",
    fontSize: theme.font.size.lg,
    lineHeight: 20,
    fontFamily: theme.font.family.bold,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 0,
    paddingHorizontal: 6,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
  },
}));
