import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { EventPreviewCard } from "./EventPreviewCard";
import type { MockEvent } from "@/data/mock-events";

type UpcomingEventsListProps = {
  events: MockEvent[];
  onEventPress?: (id: string) => void;
};

export function UpcomingEventsList({
  events,
  onEventPress,
}: UpcomingEventsListProps) {
  const visibleEvents = events.slice(0, 4);

  return (
    <View style={styles.container}>
      {visibleEvents.map((event) => (
        <EventPreviewCard
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
