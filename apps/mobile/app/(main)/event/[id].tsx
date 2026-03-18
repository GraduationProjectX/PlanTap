import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import Transition from "react-native-screen-transitions";
import { StyleSheet } from "react-native-unistyles";

import { getEventSharedBoundTag } from "@/features/events/ui";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const normalizedId = Array.isArray(id) ? id[0] : id;
  const sharedBoundTag = normalizedId ? getEventSharedBoundTag(normalizedId) : undefined;
  const eventLabel = normalizedId ?? "unknown";

  return (
    <View style={styles.container}>
      {sharedBoundTag ? (
        <Transition.View collapsable={false} style={styles.contentCard}>
          <Text style={styles.title}>Event</Text>
          <Text style={styles.subtitle}>ID: {eventLabel}</Text>
        </Transition.View>
      ) : (
        <View style={styles.contentCard}>
          <Text style={styles.title}>Event</Text>
          <Text style={styles.subtitle}>ID: {eventLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
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

