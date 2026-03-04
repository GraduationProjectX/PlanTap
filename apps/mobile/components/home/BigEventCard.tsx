import { EventCard } from "@/components/events/EventCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type BigEventCardProps = {
  event: EventRecord;
  onPress?: (id: string) => void;
  width: number;
};

function BigEventCardComponent({ event, onPress, width }: BigEventCardProps) {
  return <EventCard event={event} variant="hero" onPress={onPress} width={width} />;
}

export const BigEventCard = BigEventCardComponent;
