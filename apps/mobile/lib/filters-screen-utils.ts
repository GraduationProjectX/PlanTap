import { CATEGORIES, MOCK_EVENTS } from "@/data/mock-events";
import type { FilterType } from "@/lib/event-filters";

export type FilterOption = { id: string; label: string };

export function getCategoryLabelByIdMap(isArabic: boolean): Record<string, string> {
  return Object.fromEntries(
    CATEGORIES.filter((category) => category.id !== "all").map((category) => [
      category.id,
      isArabic ? category.labelAr : category.label,
    ]),
  ) as Record<string, string>;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

export function getCategoryIdsForType(type: FilterType): string[] {
  if (type === "both") {
    return uniqueSorted(MOCK_EVENTS.flatMap((event) => event.categories));
  }

  return uniqueSorted(
    MOCK_EVENTS.filter((event) => event.type === type).flatMap((event) => event.categories),
  );
}

export function getCitiesForType(type: FilterType): string[] {
  if (type === "both") {
    return uniqueSorted(MOCK_EVENTS.map((event) => event.city));
  }

  return uniqueSorted(
    MOCK_EVENTS.filter((event) => event.type === type).map((event) => event.city),
  );
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildMarkedDates(start?: string, end?: string): Record<string, object> {
  if (!start) return {};

  if (!end || end === start) {
    return {
      [start]: { startingDay: true, endingDay: true, color: "#000", textColor: "#FFF" },
    };
  }

  const marks: Record<string, object> = {};
  const current = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);

  while (current <= last) {
    const key = toLocalDateString(current);
    const isStart = key === start;
    const isEnd = key === end;

    marks[key] = {
      ...(isStart && { startingDay: true }),
      ...(isEnd && { endingDay: true }),
      color: isStart || isEnd ? "#000" : "#F0F0F0",
      textColor: isStart || isEnd ? "#FFF" : "#000",
    };

    current.setDate(current.getDate() + 1);
  }

  return marks;
}

export function formatRange(start?: string, end?: string, locale = "en-US"): string | null {
  if (!start) return null;

  const formatDate = (value: string) => {
    const date = new Date(`${value}T12:00:00`);
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  if (!end || end === start) return formatDate(start);
  return `${formatDate(start)} — ${formatDate(end)}`;
}

export const CALENDAR_THEME = {
  backgroundColor: "#FFFFFF",
  calendarBackground: "#FFFFFF",
  selectedDayBackgroundColor: "#000000",
  selectedDayTextColor: "#FFFFFF",
  todayTextColor: "#000000",
  dayTextColor: "#333333",
  textDisabledColor: "#D1D1D6",
  arrowColor: "#000000",
  monthTextColor: "#000000",
  textDayFontWeight: "400" as const,
  textMonthFontWeight: "700" as const,
  textDayHeaderFontWeight: "500" as const,
  textDayFontSize: 16,
  textMonthFontSize: 17,
  textDayHeaderFontSize: 13,
};
