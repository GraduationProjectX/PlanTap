import { FlashList } from "@shopify/flash-list";
import { View, useWindowDimensions } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { EventCard } from "@/components/events/EventCard";
import type { EventDoc } from "@/hooks/use-events";

type OngoingEventsCarouselProps = {
  events: EventDoc[];
  onEventPress: (id: string) => void;
};

const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;

function keyExtractor(item: EventDoc) {
  return item._id;
}

export function OngoingEventsCarousel({
  events,
  onEventPress,
}: OngoingEventsCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.75;
  const cardSizeWithGap = cardWidth + CARD_GAP;

  const renderItem = ({ item }: { item: EventDoc }) => {
    return (
      <EventCard
        event={item}
        variant="medium"
        onPress={onEventPress}
        width={cardWidth}
      />
    );
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
