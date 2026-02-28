import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "heroui-native";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import { DateBadge } from "./DateBadge";
import type { MockEvent } from "@/data/mock-events";

type UpcomingEventCardProps = {
  event: MockEvent;
  onPress?: (id: string) => void;
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDateParts(timestamp?: number) {
  if (!timestamp) return { day: 0, month: "" };
  const d = new Date(timestamp);
  return { day: d.getDate(), month: MONTH_NAMES[d.getMonth()] ?? "" };
}

export function UpcomingEventCard({ event, onPress }: UpcomingEventCardProps) {
  const { t } = useTranslation();
  const { flexDirection, textAlign } = useDirection();

  const { day, month } = getDateParts(event.startAt);
  const categoryLabel = event.categories[0]?.toUpperCase() ?? "";
  const priceLabel = event.priceMin ? `$${event.priceMin}` : t("home.freeEntry");

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
            transition={200}
          />
          <View style={styles.dateBadge}>
            <DateBadge day={day} month={month} />
          </View>
        </View>

        <View style={styles.info}>
          <View style={[styles.categoryRow, { flexDirection }]}>
            <Text style={[styles.category, { textAlign }]}>{categoryLabel}</Text>
            <Text style={styles.price}>{priceLabel}</Text>
          </View>

          <Text style={[styles.title, { textAlign }]} numberOfLines={1}>
            {event.title}
          </Text>

          <View style={[styles.locationRow, { flexDirection }]}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={[styles.location, { textAlign }]} numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>

          <Button
            variant="primary"
            size="sm"
            onPress={() => onPress?.(event.id)}
            className="mt-1"
          >
            <Button.Label>{t("home.viewDetails")}</Button.Label>
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

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
    width: 96,
    height: 96,
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
  info: {
    flex: 1,
    gap: 4,
  },
  categoryRow: {
    alignItems: "center",
    justifyContent: "space-between",
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
