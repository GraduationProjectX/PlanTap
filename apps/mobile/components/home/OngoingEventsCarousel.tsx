import { FlatList, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { BigEventCard } from "./BigEventCard";
import type { MockEvent } from "@/data/mock-events";

type OngoingEventsCarouselProps = {
  events: MockEvent[];
  onEventPress?: (id: string) => void;
};

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;

function keyExtractor(item: MockEvent) {
  return item.id;
}

export function OngoingEventsCarousel({ events, onEventPress }: OngoingEventsCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.75;

  function renderItem({ item }: { item: MockEvent }) {
    return (
      <BigEventCard
        event={item}
        onPress={onEventPress}
        width={cardWidth}
      />
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { gap: CARD_GAP, paddingHorizontal: HORIZONTAL_PADDING },
      ]}
      snapToInterval={cardWidth + CARD_GAP}
      decelerationRate="fast"
    />
  );
}

const styles = StyleSheet.create(() => ({
  content: {
    paddingVertical: 4,
  },
}));
