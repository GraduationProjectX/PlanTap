type EventTimeFields = {
  startAt: number | null;
  endAt: number | null;
};

type EventTagFields = {
  tags?: string[];
  familyFriendly: boolean | null;
  indoorOutdoor?: string;
};

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function isEventLiveNow(event: EventTimeFields): boolean {
  const now = Date.now();
  return !!(event.startAt != null && event.endAt != null && event.startAt <= now && event.endAt > now);
}

export function toTagLabel(tag: string): string {
  return tag
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getEventTagLabels(event: EventTagFields, maxTags: number): string[] {
  const tags = event.tags ?? [];

  const derivedTags = [
    event.indoorOutdoor && event.indoorOutdoor !== "unknown" ? toTagLabel(event.indoorOutdoor) : null,
    event.familyFriendly ? "For Kids" : null,
  ].filter((tag): tag is string => !!tag);

  const sourceTags = tags.map(toTagLabel);
  return Array.from(new Set([...derivedTags, ...sourceTags])).slice(0, maxTags);
}

export function getDateBadgeParts(timestamp: number | null): { day: number; month: string } {
  if (timestamp == null) return { day: 0, month: "" };
  const date = new Date(timestamp);
  return { day: date.getDate(), month: MONTH_SHORT[date.getMonth()] ?? "" };
}

export function getCountdownToStartLabel(startAt: number | null): string | null {
  if (startAt == null) return null;

  const diff = startAt - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / DAY);
  const hours = Math.floor((diff % DAY) / HOUR);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;

  const minutes = Math.floor(diff / MINUTE);
  return `${minutes}m`;
}

export function formatEventDateTime(timestamp: number | null): string | null {
  if (timestamp == null) return null;

  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, "0");
  return `${month}/${day}/${year} â€¢ ${h}:${m} ${ampm}`;
}

export function getTimeRemainingLabel(endAt: number | null): string | null {
  if (endAt == null) return null;

  const diff = endAt - Date.now();
  if (diff <= 0) return null;

  const hours = Math.floor(diff / HOUR);
  const minutes = Math.floor((diff % HOUR) / MINUTE);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
