import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import Transition from "react-native-screen-transitions";
import { StyleSheet } from "react-native-unistyles";

import { getEventSharedBoundTag } from "@/features/events/ui";
import { useEvents } from "@/hooks/use-events";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events } = useEvents();
  const normalizedId = Array.isArray(id) ? id[0] : id;
  const sharedBoundTag = normalizedId ? getEventSharedBoundTag(normalizedId) : undefined;
  const event = events?.find((item) => item._id === normalizedId);
  const imageUri = event?.images[0];
  const eventLabel = normalizedId ?? "unknown";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Transition.View
          collapsable={false}
          sharedBoundTag={sharedBoundTag}
          style={styles.heroImageContainer}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={styles.heroImageFallback} />
          )}
        </Transition.View>
        <View style={styles.contentCard}>
          <Text style={styles.title}>Event</Text>
          <Text style={styles.subtitle}>ID: {eventLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  contentCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xs,
    alignItems: "center",
  },
  heroImageContainer: {
    width: "100%",
    maxWidth: 420,
    aspectRatio: 1.5,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroImageFallback: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
}));

