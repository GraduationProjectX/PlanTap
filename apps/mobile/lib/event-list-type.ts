export type EventListType = "ongoing" | "upcoming" | "activity" | "all";

export function normalizeEventListType(type?: string): EventListType {
  if (type === "upcoming") return "upcoming";
  if (type === "activity") return "activity";
  if (type === "all") return "all";
  return "ongoing";
}
