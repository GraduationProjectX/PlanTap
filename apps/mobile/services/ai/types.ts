/**
 * Shared types for the AI recommendation service.
 *
 * Every provider must implement `AiProvider` so the caller doesn't need to
 * know which backend is being used.
 */

/** Minimal event shape passed to the prompt. */
export type EventSummary = {
  id: string;
  title: string;
  categories: string[];
  tags: string[];
  location?: string;
  date?: string;
  description?: string;
};

/** Context about the current user fed into the prompt. */
export type UserContext = {
  locale: string;
  interests?: string[];
  dislikedTags?: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  groupType?: "solo" | "group" | "kids";
  indoorOutdoor?: "indoor" | "outdoor" | "mixed" | "any";
  budgetMin?: number;
  budgetMax?: number;
  /** Tags/categories from events the user has attended or saved. */
  pastEventTags?: string[];
};

export type RecommendationType =
  | "recommendations"
  | "no_matches"
  | "follow_up"
  | "invalid_prompt";

/** The structured response we expect from every provider. */
export type RecommendationResult =
  | {
      type: "recommendations";
      eventIds: string[];
    }
  | {
      type: "no_matches";
      message: string;
      suggestions?: string[];
    }
  | {
      type: "follow_up";
      message: string;
      inputPlaceholder?: string;
      submitLabel?: string;
    }
  | {
      type: "invalid_prompt";
      message: string;
      examples?: string[];
    };

/** Abstract interface every AI provider must implement. */
export interface AiProvider {
  /** Human-readable name (for logs / UI). */
  readonly name: string;

  /**
   * Given user context and a list of candidate events, return up to 3
   * recommended event IDs as a JSON object.
   */
  generateEventRecommendations(
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ): Promise<RecommendationResult>;
}
