import type { EventDoc } from "@/hooks/use-events";
import {
  formatEventDateTime,
  getCountdownToStartLabel,
  getDateBadgeParts,
  getEventTagLabels,
  getTimeRemainingLabel,
  isEventLiveNow,
} from "@/lib/events-data";

type EventCardMetaOptions = {
  maxTags?: number;
  includeDate?: boolean;
  includeCountdown?: boolean;
  includeRemaining?: boolean;
  whenAllLabel?: string;
};

export type EventCardMeta = {
  categoryLabel: string;
  countdownLabel: string | null;
  dateBadge: { day: number; month: string };
  dateLabel: string | null;
  isActivity: boolean;
  isLive: boolean;
  locationLabel: string;
  remainingLabel: string | null;
  tagLabels: string[];
};

export function getEventCardMeta(
  event: EventDoc,
  options: EventCardMetaOptions = {},
): EventCardMeta {
  const {
    maxTags = 5,
    includeDate = false,
    includeCountdown = false,
    includeRemaining = false,
    whenAllLabel,
  } = options;

  const isActivity = event.type === "activity";
  const isLive = !isActivity && isEventLiveNow(event);
  const locationLabel = event.locationAddress ?? event.city;
  const categoryLabel = event.categories[0]?.toUpperCase() ?? "";
  const tagLabels = isActivity ? [] : getEventTagLabels(event, maxTags);
  const dateLabel = includeDate
    ? event.startAt != null
      ? formatEventDateTime(event.startAt)
      : isActivity
        ? (whenAllLabel ?? null)
        : null
    : null;
  const countdownLabel = includeCountdown ? getCountdownToStartLabel(event.startAt) : null;
  const remainingLabel = includeRemaining && isLive ? getTimeRemainingLabel(event.endAt) : null;

  return {
    categoryLabel,
    countdownLabel,
    dateBadge: getDateBadgeParts(event.startAt),
    dateLabel,
    isActivity,
    isLive,
    locationLabel,
    remainingLabel,
    tagLabels,
  };
}

export function getEventSharedBoundTag(eventId: string): string {
  return `event-card-${eventId}`;
}
