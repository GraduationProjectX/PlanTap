/**
 * Hook that fetches events + user data from Convex and runs AI recommendations.
 *
 * Returns the top 3 event IDs along with loading / error states.
 */

import { useState } from "react";
import { getRecommendations } from "@/services/ai";
import type { EventSummary, RecommendationResult, UserContext } from "@/services/ai/types";

type RecommendationState = {
  /** Top-3 recommended event IDs */
  eventIds: string[];
  /** Whether a recommendation request is in flight */
  isLoading: boolean;
  /** Last error message, if any */
  error: string | null;
};

/**
 * React hook for event recommendations.
 *
 * Usage:
 * ```tsx
 * const { eventIds, isLoading, error, recommend } =
 *   useEventRecommendations();
 * ```
 */
export function useEventRecommendations() {
  const [state, setState] = useState<RecommendationState>({
    eventIds: [],
    isLoading: false,
    error: null,
  });

  /**
   * Run recommendations with the provided data.
   * Typically called after fetching events + user profile from Convex.
   */
  const recommend = async (userContext: UserContext, events: EventSummary[], userMessage?: string) => {
    setState({ eventIds: [], isLoading: true, error: null });

    try {
      const result: RecommendationResult = await getRecommendations(
        userContext,
        events,
        userMessage,
      );
      setState({ eventIds: result.eventIds, isLoading: false, error: null });
      return result.eventIds;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      setState({ eventIds: [], isLoading: false, error: message });
      return [];
    }
  };

  return {
    ...state,
    recommend,
  };
}
