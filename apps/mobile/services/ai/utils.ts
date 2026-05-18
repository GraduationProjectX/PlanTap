import type { RecommendationResult } from "./types";

/**
 * Try to parse a provider result (string or already-parsed object) and
 * validate the minimal `RecommendationResult` shape.
 *
 * Throws on parse/validation failure.
 */
export function safeParseRecommendation(raw: unknown): RecommendationResult {
  let obj: unknown = raw;

  if (isString(raw)) {
    try {
      obj = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `Failed to parse provider response as JSON: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (!isRecord(obj)) {
    throw new Error("Invalid recommendation: expected an object");
  }

  const typeValue = obj.type;
  if (!isString(typeValue)) {
    throw new Error("Invalid recommendation: missing `type` string");
  }

  if (typeValue === "recommendations") {
    const eventIds = obj.eventIds;
    if (!isStringArray(eventIds)) {
      throw new Error("Invalid recommendation: missing `eventIds` array");
    }
    if (eventIds.length === 0) {
      throw new Error("Invalid recommendation: `eventIds` must include at least one id");
    }
    return { type: "recommendations", eventIds };
  }

  if (typeValue === "no_matches") {
    const message = obj.message;
    if (!isString(message)) {
      throw new Error("Invalid recommendation: missing `message` string");
    }
    const suggestions = obj.suggestions;
    if (suggestions != null && !isStringArray(suggestions)) {
      throw new Error("Invalid recommendation: `suggestions` must be an array of strings");
    }
    return suggestions
      ? { type: "no_matches", message, suggestions }
      : { type: "no_matches", message };
  }

  if (typeValue === "follow_up") {
    const message = obj.message;
    if (!isString(message)) {
      throw new Error("Invalid recommendation: missing `message` string");
    }
    const inputPlaceholder = obj.inputPlaceholder;
    if (inputPlaceholder != null && !isString(inputPlaceholder)) {
      throw new Error("Invalid recommendation: `inputPlaceholder` must be a string");
    }
    const submitLabel = obj.submitLabel;
    if (submitLabel != null && !isString(submitLabel)) {
      throw new Error("Invalid recommendation: `submitLabel` must be a string");
    }
    return {
      type: "follow_up",
      message,
      ...(inputPlaceholder ? { inputPlaceholder } : {}),
      ...(submitLabel ? { submitLabel } : {}),
    };
  }

  if (typeValue === "invalid_prompt") {
    const message = obj.message;
    if (!isString(message)) {
      throw new Error("Invalid recommendation: missing `message` string");
    }
    const examples = obj.examples;
    if (examples != null && !isStringArray(examples)) {
      throw new Error("Invalid recommendation: `examples` must be an array of strings");
    }
    return examples
      ? { type: "invalid_prompt", message, examples }
      : { type: "invalid_prompt", message };
  }

  throw new Error("Invalid recommendation: unknown `type`");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

/**
 * Generic retry helper with exponential backoff.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 4000,
  shouldRetry?: (err: unknown) => boolean,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (shouldRetry && !shouldRetry(err)) {
        break;
      }
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
