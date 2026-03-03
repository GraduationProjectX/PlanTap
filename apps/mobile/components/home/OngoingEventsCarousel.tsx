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

export function OngoingEventsCarousel({
  events,
  onEventPress,
}: OngoingEventsCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.75;
  const cardSizeWithGap = cardWidth + CARD_GAP;

  const renderItem = ({ item }: { item: MockEvent }) => {
    return <BigEventCard event={item} onPress={onEventPress} width={cardWidth} />;
  };

  const getItemLayout = (_data: ArrayLike<MockEvent> | null | undefined, index: number) => ({
    length: cardSizeWithGap,
    offset: cardSizeWithGap * index,
    index,
  });

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { gap: CARD_GAP, paddingHorizontal: HORIZONTAL_PADDING },
      ]}
      snapToInterval={cardSizeWithGap}
      decelerationRate="fast"
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={60}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create(() => ({
  content: {
    paddingVertical: 4,
  },
}));
