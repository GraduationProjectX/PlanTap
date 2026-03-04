import { FlashList } from "@shopify/flash-list";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { EventCard } from "@/components/events/EventCard";
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
    return <EventCard event={item} variant="preview-list" onPress={onEventPress} />;
  };

  return (
    <FlashList
      data={visibleEvents}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemType={() => "upcoming-event-preview"}
      ItemSeparatorComponent={Separator}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  separator: {
    height: theme.spacing.sm,
  },
}));

function Separator() {
  return <View style={styles.separator} />;
}
