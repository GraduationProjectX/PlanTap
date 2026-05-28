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
    const rawText = raw;
    const normalizedText = normalizeProviderJsonText(rawText);

    try {
      obj = JSON.parse(normalizedText);
    } catch (err) {
      const preview = normalizedText.replace(/\s+/g, " ").slice(0, 180);
      throw new Error(
        `Failed to parse provider response as JSON: ${err instanceof Error ? err.message : String(err)}${preview.length > 0 ? ` (preview: "${preview}")` : ""}`,
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
    const eventIdsAlias = obj.event_ids;
    const resolvedEventIds = isStringArray(eventIds)
      ? eventIds
      : isStringArray(eventIdsAlias)
        ? eventIdsAlias
        : null;

    if (!resolvedEventIds) {
      throw new Error("Invalid recommendation: missing `eventIds` array");
    }
    if (resolvedEventIds.length === 0) {
      throw new Error("Invalid recommendation: `eventIds` must include at least one id");
    }
    return { type: "recommendations", eventIds: resolvedEventIds };
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

function normalizeProviderJsonText(raw: string): string {
  let text = raw.trim();

  // Strip BOM if present.
  if (text.length > 0 && text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1).trim();
  }

  // If response is wrapped in ```json ...```, extract the fenced block.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    text = fenceMatch[1].trim();
  }

  // Remove leading control characters and zero-width markers that can
  // appear before the JSON payload.
  text = text.replace(/^[\u0000-\u001F\u200B-\u200D\uFEFF]+/g, "");

  const balancedJson = extractBalancedJsonObject(text);
  if (balancedJson) {
    text = balancedJson;
  }

  return text;
}

function extractBalancedJsonObject(text: string): string | null {
  let startIndex = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (startIndex === -1) {
      if (char === "{") {
        startIndex = index;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(startIndex, index + 1).trim();
      }
    }
  }

  return null;
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
