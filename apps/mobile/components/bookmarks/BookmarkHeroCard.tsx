import { EventCard } from "@/components/events/EventCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type BookmarkHeroCardProps = {
  event: EventRecord;
  onPress?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
};

function BookmarkHeroCardComponent({
  event,
  onPress,
  onBookmark,
  isBookmarked,
}: BookmarkHeroCardProps) {
  return (
    <EventCard
      event={event}
      variant="bookmark-hero"
      onPress={onPress}
      onBookmark={onBookmark}
      isBookmarked={isBookmarked}
    />
  );
}

export const BookmarkHeroCard = BookmarkHeroCardComponent;
