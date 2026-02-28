import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { UpcomingEventCard } from "./UpcomingEventCard";
import type { MockEvent } from "@/data/mock-events";

type UpcomingEventsListProps = {
  events: MockEvent[];
  onEventPress?: (id: string) => void;
};

export function UpcomingEventsList({ events, onEventPress }: UpcomingEventsListProps) {
  return (
    <View style={styles.container}>
      {events.slice(0, 4).map((event) => (
        <UpcomingEventCard
          key={event.id}
          event={event}
          onPress={onEventPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },
}));
