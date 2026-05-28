import type { EventDoc } from "@/hooks/use-events";
import { toLocalDateString } from "@/features/filters/utils";

type EventTimeFields = {
  startAt: number | null;
  endAt: number | null;
};

type EventTagFields = {
  tags?: string[];
  familyFriendly: boolean | null;
  indoorOutdoor?: string;
};

export type FilterType = "event" | "activity" | "both";
export type FilterTiming = "all" | "ongoing" | "upcoming";
export type FilterDate = "any" | "today" | "thisWeekend" | "next7Days" | "specificDates";
export type FilterActivityMode = "all" | "indoor" | "outdoor" | "mixed";
export type EventListType = "ongoing" | "upcoming" | "activity" | "all";

export type EventFilters = {
  type: FilterType;
  categories: string[];
  cities: string[];
  date: FilterDate;
  startDate?: string;
  endDate?: string;
  timing: FilterTiming;
  activityMode: FilterActivityMode;
};

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  type: "both",
  categories: [],
  cities: [],
  date: "any",
  timing: "all",
  activityMode: "all",
};

export function normalizeEventListType(type?: string): EventListType {
  if (type === "upcoming") return "upcoming";
  if (type === "activity") return "activity";
  if (type === "all") return "all";
  return "ongoing";
}

export function isDefaultEventFilters(filters: EventFilters): boolean {
  return (
    filters.type === DEFAULT_EVENT_FILTERS.type &&
    filters.categories.length === 0 &&
    filters.cities.length === 0 &&
    filters.date === DEFAULT_EVENT_FILTERS.date &&
    filters.timing === DEFAULT_EVENT_FILTERS.timing &&
    filters.activityMode === DEFAULT_EVENT_FILTERS.activityMode
  );
}

export function isEventLiveNow(event: EventTimeFields): boolean {
  const now = Date.now();
  return !!(
    event.startAt != null &&
    event.endAt != null &&
    event.startAt <= now &&
    event.endAt > now
  );
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
    event.indoorOutdoor && event.indoorOutdoor !== "unknown"
      ? toTagLabel(event.indoorOutdoor)
      : null,
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
  return `${month}/${day}/${year} - ${h}:${m} ${ampm}`;
}

export function formatEventDateRange(
  startAt: number | null,
  endAt: number | null,
  locale = "en-US",
): string | null {
  if (startAt == null) {
    return null;
  }

  const formatDate = (value: number) => {
    return new Date(value).toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  const startLabel = formatDate(startAt);

  if (endAt == null) {
    return startLabel;
  }

  const endLabel = formatDate(endAt);
  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
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

function isEventOngoing(event: EventDoc, now: number): boolean {
  return !!(event.startAt && event.endAt && event.startAt <= now && event.endAt > now);
}

function isEventUpcoming(event: EventDoc, now: number): boolean {
  return !!(event.startAt && event.startAt > now);
}

function isSameDay(timestamp: number, now: number): boolean {
  const date = new Date(timestamp);
  const current = new Date(now);
  return (
    date.getFullYear() === current.getFullYear() &&
    date.getMonth() === current.getMonth() &&
    date.getDate() === current.getDate()
  );
}

function isThisWeekend(timestamp: number, now: number): boolean {
  const date = new Date(timestamp);
  const current = new Date(now);
  const currentDay = current.getDay();
  const daysUntilSaturday = (6 - currentDay + 7) % 7;

  const saturdayStart = new Date(current);
  saturdayStart.setHours(0, 0, 0, 0);
  saturdayStart.setDate(current.getDate() + daysUntilSaturday);

  const sundayEnd = new Date(saturdayStart);
  sundayEnd.setDate(saturdayStart.getDate() + 1);
  sundayEnd.setHours(23, 59, 59, 999);

  return (
    timestamp >= saturdayStart.getTime() && timestamp <= sundayEnd.getTime() && date >= current
  );
}

function matchesDateFilter(
  event: EventDoc,
  dateFilter: FilterDate,
  now: number,
  startDate?: string,
  endDate?: string,
): boolean {
  if (dateFilter === "any") return true;
  if (!event.startAt) return false;

  if (dateFilter === "specificDates") {
    if (!startDate || !endDate) return true;
    const eventStr = toLocalDateString(new Date(event.startAt));
    return eventStr >= startDate && eventStr <= endDate;
  }

  if (dateFilter === "today") {
    return isSameDay(event.startAt, now);
  }

  if (dateFilter === "thisWeekend") {
    return isThisWeekend(event.startAt, now);
  }

  return event.startAt >= now && event.startAt <= now + 7 * DAY;
}

export function applyEventFilters(events: EventDoc[], filters: EventFilters | null): EventDoc[] {
  if (!filters) return events;

  const now = Date.now();

  return events.filter((event) => {
    if (filters.type !== "both" && event.type !== filters.type) return false;

    if (filters.categories.length > 0) {
      const hasCategory = event.categories.some((category) =>
        filters.categories.includes(category),
      );
      if (!hasCategory) return false;
    }

    if (filters.cities.length > 0 && !filters.cities.includes(event.city)) {
      return false;
    }

    if (!matchesDateFilter(event, filters.date, now, filters.startDate, filters.endDate)) {
      return false;
    }

    if (filters.type === "event") {
      if (filters.timing === "ongoing" && !isEventOngoing(event, now)) return false;
      if (filters.timing === "upcoming" && !isEventUpcoming(event, now)) return false;
    }

    if (filters.type === "activity") {
      if (filters.activityMode !== "all" && event.indoorOutdoor !== filters.activityMode) {
        return false;
      }
    }

    return true;
  });
}
