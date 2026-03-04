import { EventCard } from "@/components/events/EventCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type BookmarkGridCardProps = {
  event: EventRecord;
  onPress?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
};

function BookmarkGridCardComponent({
  event,
  onPress,
  onBookmark,
  isBookmarked,
}: BookmarkGridCardProps) {
  return (
    <EventCard
      event={event}
      variant="bookmark-grid"
      onPress={onPress}
      onBookmark={onBookmark}
      isBookmarked={isBookmarked}
    />
  );
}

export const BookmarkGridCard = BookmarkGridCardComponent;
