import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/rtl";
import type { MockEvent } from "@/data/mock-events";

type RecommendedEventCardProps = {
  event: MockEvent;
  onPress?: (id: string) => void;
  onFavorite?: (id: string) => void;
};

export function RecommendedEventCard({ event, onPress, onFavorite }: RecommendedEventCardProps) {
  const { t } = useTranslation();
  const { textAlign } = useDirection();

  const priceLabel = event.priceMin ? `$${event.priceMin} Entry` : t("home.freeEntry");
  const dateStr = event.startAt
    ? new Date(event.startAt).toLocaleDateString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const locationStr = event.location.address ?? event.city;

  return (
    <Pressable onPress={() => onPress?.(event.id)} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {event.rating && (
          <View style={styles.ratingBadge}>
            <FontAwesome name="star" size={10} color="#FFFFFF" />
            <Text style={styles.ratingText}>{event.rating.toFixed(1)}</Text>
          </View>
        )}

        <Pressable
          onPress={() => onFavorite?.(event.id)}
          style={styles.favoriteButton}
          hitSlop={8}
        >
          <FontAwesome name="heart-o" size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { textAlign }]} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={[styles.subtitle, { textAlign }]} numberOfLines={1}>
          {dateStr} {locationStr ? `• ${locationStr}` : ""}
        </Text>
        <Text style={[styles.price, { textAlign }]}>{priceLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    flex: 1,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderCurve: "continuous",
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.bold,
  },
  favoriteButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: theme.spacing.sm,
    gap: 2,
  },
  title: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
    marginTop: 2,
  },
}));
