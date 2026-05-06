/**
 * Builds a real UserContext + EventSummary[] from Convex data
 * so the AI suggestion engine works with live data.
 *
 * NOTE: The `backend` workspace package is not yet linked as a dependency of
 * mobile — see use-events.ts for the same issue. Once it is wired up, swap
 * the fallback logic below for proper type-safe API calls.
 */

import { useQuery } from "convex/react";
import type { EventSummary, UserContext } from "@/services/ai/types";

let api: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  api = require("backend/convex/_generated/api").api;
} catch {
  api = null;
}

const UNAVAILABLE_RESULT = {
  isLoading: false as const,
  userContext: null,
  events: null,
  unavailable: true as const,
} as const;

/**
 * Inner hook — only called when `api` is available so the useQuery calls
 * always receive a valid function reference.
 */
function useAiContextInner(city?: string) {
  const user = useQuery(api.users.current, {});
  const events = useQuery(api.events.listApproved, { city, limit: 100 });

  const isLoading = user === undefined || events === undefined;

  if (isLoading) {
    return { isLoading: true as const, userContext: null, events: null, unavailable: false as const };
  }

  const userContext: UserContext = {
    locale: user?.locale ?? "en",
    interests: user?.preferences?.likedTags ?? [],
    dislikedTags: user?.preferences?.dislikedTags ?? [],
    city: city ?? user?.city,
    groupType: user?.defaults?.groupType,
    indoorOutdoor: user?.defaults?.indoorOutdoor,
    budgetMin: user?.defaults?.budgetMin,
    budgetMax: user?.defaults?.budgetMax,
    pastEventTags: [],
  };

  const eventSummaries: EventSummary[] = (events ?? []).map((e: any) => ({
    id: e._id,
    title: e.title,
    categories: e.categories,
    tags: e.tags,
    location: e.location?.address ?? e.city,
    date: e.startAt ? new Date(e.startAt).toISOString().slice(0, 10) : undefined,
    description: e.descriptionShort ?? undefined,
  }));

  return {
    isLoading: false as const,
    userContext,
    events: eventSummaries,
    unavailable: false as const,
  };
}

/**
 * Public hook. When the backend package isn't linked, returns an
 * `unavailable` result without calling any Convex hooks.
 */
export function useAiContext(city?: string) {
  if (!api) return UNAVAILABLE_RESULT;
  return useAiContextInner(city);
}
