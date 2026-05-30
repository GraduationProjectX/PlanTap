import { useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Doc } from "backend/convex/_generated/dataModel";
import type { EventSummary, UserContext } from "@/services/ai/types";

type EventDoc = Doc<"events">;

function normalizeGroupType(
  groupType: "any" | "solo" | "group" | "kids" | null | undefined,
): UserContext["groupType"] {
  if (groupType === "solo" || groupType === "group" || groupType === "kids") {
    return groupType;
  }
  return undefined;
}

export function useAiContext(city?: string, enabled: boolean = true) {
  const user = useQuery(api.users.current, enabled ? {} : "skip");
  const events = useQuery(api.events.list, enabled ? (city ? { city } : {}) : "skip");

  const isLoading = (enabled && user === undefined) || events === undefined;

  if (isLoading) {
    return {
      isLoading: true,
      userContext: null,
      events: null,
      unavailable: false,
    };
  }

  const userContext: UserContext | null = enabled
    ? {
        locale: user?.locale ?? "en",
        interests: user?.preferences?.likedTags ?? [],
        dislikedTags: user?.preferences?.dislikedTags ?? [],
        city: city ?? user?.city ?? undefined,
        groupType: normalizeGroupType(user?.defaults?.groupType),
        indoorOutdoor: user?.defaults?.indoorOutdoor,
        budgetMin: user?.defaults?.budgetMin ?? undefined,
        budgetMax: user?.defaults?.budgetMax ?? undefined,
        pastEventTags: [],
      }
    : null;

  const eventSummaries: EventSummary[] = (events ?? []).slice(0, 100).map((event: EventDoc) => ({
    id: event._id,
    title: event.title,
    categories: event.categories,
    tags: event.tags,
    location: event.locationAddress ?? event.city,
    date: event.startAt ? new Date(event.startAt).toISOString().slice(0, 10) : undefined,
    description: event.descriptionShort ?? undefined,
  }));

  return {
    isLoading: false,
    userContext,
    events: eventSummaries,
    unavailable: false,
  };
}
