import { FlashList } from "@shopify/flash-list";
import { StyleSheet } from "react-native-unistyles";
import { EventPreviewCard } from "./EventPreviewCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type UpcomingEventsListProps = {
  events: EventRecord[];
  onEventPress?: (id: string) => void;
};

function keyExtractor(item: EventRecord) {
  return item.id;
}

export function UpcomingEventsList({
  events,
  onEventPress,
}: UpcomingEventsListProps) {
  const visibleEvents = events.slice(0, 4);

  const renderItem = ({ item }: { item: EventRecord }) => {
    return <EventPreviewCard event={item} onPress={onEventPress} />;
  };

  return (
    <FlashList
      data={visibleEvents}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemType={() => "upcoming-event-preview"}
      scrollEnabled={false}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.sm,
  },
}));
