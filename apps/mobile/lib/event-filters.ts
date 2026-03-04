import type { EventRecord } from "@/lib/events/event-contracts";

export type FilterType = "event" | "activity" | "both";
export type FilterTiming = "all" | "ongoing" | "upcoming";
export type FilterDate = "any" | "today" | "thisWeekend" | "next7Days" | "specificDates";
export type FilterActivityMode = "all" | "indoor" | "outdoor" | "mixed";

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

const DAY = 24 * 60 * 60 * 1000;

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  type: "both",
  categories: [],
  cities: [],
  date: "any",
  timing: "all",
  activityMode: "all",
};

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

function isEventOngoing(event: EventRecord, now: number): boolean {
  return !!(event.startAt && event.endAt && event.startAt <= now && event.endAt > now);
}

function isEventUpcoming(event: EventRecord, now: number): boolean {
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

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function matchesDateFilter(
  event: EventRecord,
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

export function applyEventFilters(events: EventRecord[], filters: EventFilters | null): EventRecord[] {
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
