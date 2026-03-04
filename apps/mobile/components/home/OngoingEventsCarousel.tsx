import { FlashList } from "@shopify/flash-list";
import { View, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { EventCard } from "@/components/events/EventCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type OngoingEventsCarouselProps = {
  events: EventRecord[];
  onEventPress?: (id: string) => void;
};

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;

function keyExtractor(item: EventRecord) {
  return item.id;
}

export function OngoingEventsCarousel({
  events,
  onEventPress,
}: OngoingEventsCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.75;
  const cardSizeWithGap = cardWidth + CARD_GAP;

  const renderItem = ({ item }: { item: EventRecord }) => {
    return <EventCard event={item} variant="hero" onPress={onEventPress} width={cardWidth} />;
  };

  return (
    <FlashList
      data={events}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={() => "ongoing-event-card"}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      snapToInterval={cardSizeWithGap}
      decelerationRate="fast"
      drawDistance={cardSizeWithGap * 2}
    />
  );
}

const styles = StyleSheet.create(() => ({
  content: {
    paddingVertical: 4,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  separator: {
    width: CARD_GAP,
  },
}));

function Separator() {
  return <View style={styles.separator} />;
}
