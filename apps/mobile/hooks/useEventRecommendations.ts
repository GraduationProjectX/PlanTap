import { useState } from "react";
import { getRecommendations } from "@/services/ai";
import type { EventSummary, RecommendationResult, UserContext } from "@/services/ai/types";

type RecommendationState = {
  /** Latest provider response */
  response: RecommendationResult | null;
  eventIds: string[];
  isLoading: boolean;
  error: string | null;
};

export function useEventRecommendations() {
  const [state, setState] = useState<RecommendationState>({
    response: null,
    eventIds: [],
    isLoading: false,
    error: null,
  });

  /**
   * Run recommendations with the provided data.
   */
  const recommend = async (
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ) => {
    setState({ response: null, eventIds: [], isLoading: true, error: null });

    try {
      const result: RecommendationResult = await getRecommendations(
        userContext,
        events,
        userMessage,
      );
      const eventIds = result.type === "recommendations" ? result.eventIds : [];
      setState({ response: result, eventIds, isLoading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ response: null, eventIds: [], isLoading: false, error: message });
      return null;
    }
  };

  return {
    ...state,
    recommend,
  };
}
