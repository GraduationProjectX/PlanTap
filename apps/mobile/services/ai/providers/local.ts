import { initLlama, type LlamaContext } from "llama.rn";
import { NativeModules } from "react-native";
import { buildPromptPayload, buildSystemPrompt, AI_RESPONSE_GBNF } from "../prompts";
import { rankEventsByRelevance } from "../eventRanker";
import { validateResponse } from "../responseValidator";
import type { AiProvider, EventSummary, RecommendationResult, UserContext } from "../types";

let _ctx: LlamaContext | null = null;
let _ctxModelPath: string | null = null;
let _initPromise: Promise<LlamaContext> | null = null;
let _initPromiseModelPath: string | null = null;

const LOCAL_RAG_EVENT_LIMIT = 8;
const LOCAL_MAX_TAGS = 3;
const LOCAL_MAX_DESCRIPTION = 50;
const LOCAL_MAX_TITLE = 60;
const LOCAL_RETRY_PREDICT = 120;
const LOCAL_PRIMARY_PREDICT = 160;

function isCompactFirstModel(modelPath: string): boolean {
  const lower = modelPath.toLowerCase();
  return !lower.includes("qwen");
}

function getDeviceCores(): number {
  try {
    const deviceInfo = NativeModules.DeviceInfo;
    const constants = deviceInfo?.getConstants?.();
    const candidates = ["NumberOfCores", "NumberOfCPUs", "ProcessorCount", "cpuCount", "numCores"];
    for (const k of candidates) {
      const v = constants?.[k];
      if (isNumber(v) && v > 0) return v;
    }
  } catch {
    // fallthrough
  }
  return 4;
}

function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === "[object Number]";
}

/**
 * Initialise (or re-use) the llama.rn context for the given model file.
 * The first call loads the model into memory which may take a few seconds.
 */
async function getContext(modelPath: string): Promise<LlamaContext> {
  if (_ctx && _ctxModelPath === modelPath) {
    return _ctx;
  }

  // If an initialization for this model is already in progress, wait for it.
  if (_initPromise && _initPromiseModelPath === modelPath) {
    return _initPromise;
  }

  // If a different model is loaded, release it.
  if (_ctx && _ctxModelPath !== modelPath) {
    try {
      await _ctx.release();
    } catch {}
    _ctx = null;
    _ctxModelPath = null;
  }

  const cores = getDeviceCores();
  const nThreads = Math.max(1, Math.floor(cores / 2));
  const nCtx = 2048;

  _initPromiseModelPath = modelPath;
  _initPromise = (async () => {
    try {
      const ctx = await initLlama({
        model: modelPath,
        n_ctx: nCtx,
        n_threads: nThreads,
        use_mlock: true,
      });
      _ctx = ctx;
      _ctxModelPath = modelPath;
      return ctx;
    } finally {
      _initPromise = null;
      _initPromiseModelPath = null;
    }
  })();

  return _initPromise;
}

/** Release memory held by the local model. */
export async function releaseLocalModel(): Promise<void> {
  if (_ctx) {
    await _ctx.release();
    _ctx = null;
    _ctxModelPath = null;
  }
}

function compactLocalEvents(events: EventSummary[], userContext: UserContext): EventSummary[] {
  const ranked = rankEventsByRelevance(events, userContext, LOCAL_RAG_EVENT_LIMIT);

  return ranked.map((event) => ({
    ...event,
    title: event.title.slice(0, LOCAL_MAX_TITLE),
    categories: event.categories.slice(0, LOCAL_MAX_TAGS),
    tags: event.tags.slice(0, LOCAL_MAX_TAGS),
    description: event.description ? event.description.slice(0, LOCAL_MAX_DESCRIPTION) : undefined,
  }));
}

function buildLocalFallbackPrompt(
  userContext: UserContext,
  events: EventSummary[],
  userMessage?: string,
): string {
  const compactUser = {
    locale: userContext.locale,
    city: userContext.city ?? "N/A",
    interests: userContext.interests ?? [],
    dislikedTags: userContext.dislikedTags ?? [],
    groupType: userContext.groupType ?? "any",
    indoorOutdoor: userContext.indoorOutdoor ?? "any",
  };

  const compactEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    categories: event.categories,
    tags: event.tags,
  }));

  const note = userMessage?.trim() ? `\nNote: ${userMessage.trim()}` : "";

  return `User:${JSON.stringify(compactUser)}\nEvents:${JSON.stringify(compactEvents)}${note}\nReturn ONLY JSON with one of these shapes:\n{"type":"recommendations","eventIds":["id1","id2","id3"]}\n{"type":"no_matches","message":"..."}\n{"type":"follow_up","message":"..."}\n{"type":"invalid_prompt","message":"..."}`;
}

export class LocalProvider implements AiProvider {
  readonly name = "Local (on-device)";

  constructor(private modelPath: string) {}

  async generateEventRecommendations(
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ): Promise<RecommendationResult> {
    try {
      if (!this.modelPath) {
        throw new Error("No local model downloaded");
      }

      const ctx = await getContext(this.modelPath);

      const systemPrompt = buildSystemPrompt();
      const compactEvents = compactLocalEvents(events, userContext);
      const promptPayload = buildPromptPayload(userContext, compactEvents, userMessage);

      const useCompactFirst = isCompactFirstModel(this.modelPath);
      const fallbackPrompt = buildLocalFallbackPrompt(
        userContext,
        promptPayload.candidateEvents,
        userMessage,
      );

      const primary = await ctx.completion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: useCompactFirst ? fallbackPrompt : promptPayload.prompt },
        ],
        n_predict: useCompactFirst ? LOCAL_RETRY_PREDICT : LOCAL_PRIMARY_PREDICT,
        temperature: useCompactFirst ? 0 : 0.3,
        grammar: AI_RESPONSE_GBNF,
      });

      const primaryValidation = validateResponse(primary.text, promptPayload.candidateIds);
      if (primaryValidation.valid && primaryValidation.result) {
        return primaryValidation.result;
      }

      const errorMessage = primaryValidation.error ?? "Response validation failed";
      const shouldRetry =
        !useCompactFirst && errorMessage.includes("Failed to parse provider response as JSON");
      if (!shouldRetry) {
        throw new Error(errorMessage);
      }

      const fallback = await ctx.completion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fallbackPrompt },
        ],
        n_predict: LOCAL_RETRY_PREDICT,
        temperature: 0,
        grammar: AI_RESPONSE_GBNF,
      });

      const fallbackValidation = validateResponse(fallback.text, promptPayload.candidateIds);
      if (!fallbackValidation.valid || !fallbackValidation.result) {
        throw new Error(fallbackValidation.error || "Response validation failed");
      }
      return fallbackValidation.result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Local model failed: ${message}`);
    }
  }
}
