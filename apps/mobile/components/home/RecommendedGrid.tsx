import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { RecommendedEventCard } from "./RecommendedEventCard";
import type { MockEvent } from "@/data/mock-events";

type RecommendedGridProps = {
  events: MockEvent[];
  onEventPress?: (id: string) => void;
  onFavorite?: (id: string) => void;
};

export function RecommendedGrid({ events, onEventPress, onFavorite }: RecommendedGridProps) {
  return (
    <View style={styles.grid}>
      {events.slice(0, 4).map((event) => (
        <RecommendedEventCard
          key={event.id}
          event={event}
          onPress={onEventPress}
          onFavorite={onFavorite}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
}));
