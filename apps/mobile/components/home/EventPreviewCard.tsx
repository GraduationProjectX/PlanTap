import { EventCard } from "@/components/events/EventCard";
import type { EventRecord } from "@/lib/events/event-contracts";

type EventPreviewCardProps = {
  event: EventRecord;
  onPress?: (id: string) => void;
  showCountdown?: boolean;
  variant?: "list" | "grid";
};

function EventPreviewCardComponent({
  event,
  onPress,
  showCountdown = true,
  variant = "list",
}: EventPreviewCardProps) {
  return (
    <EventCard
      event={event}
      variant={variant === "grid" ? "preview-grid" : "preview-list"}
      onPress={onPress}
      showCountdown={showCountdown}
    />
  );
}

export const EventPreviewCard = EventPreviewCardComponent;
