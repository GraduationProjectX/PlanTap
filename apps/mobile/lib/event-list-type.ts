export type EventListType = "ongoing" | "upcoming" | "recommended" | "all";

export function normalizeEventListType(type?: string): EventListType {
  if (type === "upcoming") return "upcoming";
  if (type === "recommended") return "recommended";
  if (type === "all") return "all";
  return "ongoing";
}
