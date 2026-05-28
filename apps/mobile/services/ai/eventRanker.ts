/**
 * Event relevance ranking system (RAG pre-filtering).
 *
 * Ranks events by relevance to user context before sending to LLM.
 * Filters 50 events down to ~15-20 most relevant candidates.
 */

import type { EventSummary, UserContext } from "./types";

interface ScoredEvent {
  event: EventSummary;
  score: number;
}

/**
 * Calculate relevance score for a single event (0-100).
 *
 * Considers:
 * - User interests (tag/category match): 0-30 pts
 * - Disliked tags (penalty): -0 to -30 pts
 * - Location proximity: 0-20 pts
 * - Budget fit: 0-15 pts
 * - Group type: 0-10 pts
 * - Indoor/outdoor preference: 0-10 pts
 * - Variety (avoid past tags unless explicit): 0-15 pts
 *
 * Total possible: 0-100
 */
function calculateEventScore(event: EventSummary, userContext: UserContext): number {
  let score = 0;

  // 1. Interest matching (0-30 pts)
  const eventTags = new Set(
    [...(event.tags ?? []), ...(event.categories ?? [])].map((t) => t.toLowerCase()),
  );

  const userInterests = (userContext.interests ?? []).map((i) => i.toLowerCase());
  let interestMatches = 0;
  for (const interest of userInterests) {
    if (eventTags.has(interest)) {
      interestMatches += 1;
    }
  }
  score += Math.min(30, interestMatches * 10);

  // 2. Disliked tags penalty (0 to -30 pts)
  const dislikedTags = (userContext.dislikedTags ?? []).map((t) => t.toLowerCase());
  let dislikedMatches = 0;
  for (const disliked of dislikedTags) {
    if (eventTags.has(disliked)) {
      dislikedMatches += 1;
    }
  }
  score -= Math.min(30, dislikedMatches * 15);

  // 3. Location proximity (0-20 pts)
  // Simple check: same city = 20 pts
  if (
    userContext.city &&
    event.location &&
    userContext.city.toLowerCase() === event.location.toLowerCase()
  ) {
    score += 20;
  } else if (userContext.city && event.location) {
    // Partial location match (e.g., neighborhood contains city)
    if (event.location.toLowerCase().includes(userContext.city.toLowerCase())) {
      score += 15;
    }
  }

  // 4. Budget fit (0-15 pts) - NOTE: EventSummary doesn't have price fields
  // This section will be handled once backend provides pricing data
  // if (event.priceMin != null && event.priceMax != null && ...)

  // 7. Variety: penalize events with tags the user has attended before (0 to -15 pts)
  const pastTags = (userContext.pastEventTags ?? []).map((t) => t.toLowerCase());
  let pastTagMatches = 0;
  for (const pastTag of pastTags) {
    if (eventTags.has(pastTag)) {
      pastTagMatches += 1;
    }
  }
  // Slight penalty for repetition, but not severe (they might want more music events)
  score -= Math.min(15, pastTagMatches * 3);

  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

/**
 * Rank events by relevance and return top-N candidates.
 *
 * @param events - All available events (typically ~50 from backend)
 * @param userContext - User profile and preferences
 * @param topN - Number of top events to return (default: 15)
 * @returns Top N events sorted by relevance score (descending)
 */
export function rankEventsByRelevance(
  events: EventSummary[],
  userContext: UserContext,
  topN: number = 15,
): EventSummary[] {
  const scored: ScoredEvent[] = events.map((event) => ({
    event,
    score: calculateEventScore(event, userContext),
  }));

  // Sort by score descending, then by event ID for stable ordering
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.event.id.localeCompare(b.event.id);
  });

  return scored.slice(0, Math.min(topN, events.length)).map((s) => s.event);
}

/**
 * Get debug info about event ranking (for benchmarking/analysis).
 * Returns scores for all events to understand ranking distribution.
 */
export function getEventRankingDebugInfo(
  events: EventSummary[],
  userContext: UserContext,
): Array<{ eventId: string; title: string; score: number }> {
  return events
    .map((event) => ({
      eventId: event.id,
      title: event.title,
      score: calculateEventScore(event, userContext),
    }))
    .sort((a, b) => b.score - a.score);
}
