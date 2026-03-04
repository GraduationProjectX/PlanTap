import { EventCard } from "@/components/events/EventCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type MediumEventCardProps = {
  event: EventRecord;
  width: number;
  onPress?: (id: string) => void;
};

function MediumEventCardComponent({ event, width, onPress }: MediumEventCardProps) {
  return <EventCard event={event} variant="medium" onPress={onPress} width={width} />;
}

export const MediumEventCard = MediumEventCardComponent;
