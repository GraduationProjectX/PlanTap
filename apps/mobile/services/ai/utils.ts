import type { RecommendationResult } from "./types";

/**
 * Try to parse a provider result (string or already-parsed object) and
 * validate the minimal `RecommendationResult` shape.
 *
 * Throws on parse/validation failure.
 */
export function safeParseRecommendation(raw: unknown): RecommendationResult {
  let obj: unknown = raw;

  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to parse provider response as JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (typeof obj !== "object" || obj === null) {
    throw new Error("Invalid recommendation: expected an object");
  }

  const maybe = obj as { eventIds?: unknown };
  if (!Array.isArray(maybe.eventIds)) {
    throw new Error("Invalid recommendation: missing `eventIds` array");
  }
  if (!maybe.eventIds.every((id) => typeof id === "string")) {
    throw new Error("Invalid recommendation: `eventIds` must be an array of strings");
  }

  return { eventIds: maybe.eventIds as string[] };
}

/**
 * Generic retry helper with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 4000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * 2 ** attempt;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

/**
 * Fetch with an AbortController timeout. Returns the fetch `Response` or
 * throws if aborted/failed.
 */
export async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = 15_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input as any, { ...(init ?? {}), signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
