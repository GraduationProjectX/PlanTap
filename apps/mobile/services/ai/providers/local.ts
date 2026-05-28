import { initLlama, type LlamaContext } from "llama.rn";
import { buildSystemPrompt, AI_RESPONSE_GBNF } from "../prompts";
import { rankEventsByRelevance } from "../eventRanker";
import { validateResponse } from "../responseValidator";
import type {
  AiProvider,
  EventSummary,
  RecommendationResult,
  UserContext,
} from "../types";

let _ctx: LlamaContext | null = null;
let _ctxModelPath: string | null = null;
let _initPromise: Promise<LlamaContext> | null = null;
let _initPromiseModelPath: string | null = null;

const LOCAL_RAG_EVENT_LIMIT = 8;
const LOCAL_MAX_TAGS = 3;
const LOCAL_MAX_DESCRIPTION = 50;
const LOCAL_MAX_TITLE = 60;
const LOCAL_MAX_NOTE = 150;

function getDeviceCores(): number {
  try {
    const modules = (global as any).NativeModules as Record<string, any> | undefined;
    const deviceInfo = modules?.DeviceInfo;
    const constants = deviceInfo?.getConstants?.();
    const candidates = [
      "NumberOfCores",
      "NumberOfCPUs",
      "ProcessorCount",
      "cpuCount",
      "numCores",
    ];
    for (const k of candidates) {
      const v = constants?.[k];
      if (isNumber(v) && v > 0) return v;
    }
  } catch {
    // fallthrough
  }
  try {
    const v = (global as any).navigator?.hardwareConcurrency;
    if (isNumber(v) && v > 0) return v;
  } catch {}
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

function compactLocalEvents(
  events: EventSummary[],
  userContext: UserContext,
): EventSummary[] {
  const ranked = rankEventsByRelevance(events, userContext, LOCAL_RAG_EVENT_LIMIT);

  return ranked.map((event) => ({
    ...event,
    title: event.title.slice(0, LOCAL_MAX_TITLE),
    categories: event.categories.slice(0, LOCAL_MAX_TAGS),
    tags: event.tags.slice(0, LOCAL_MAX_TAGS),
    description: event.description ? event.description.slice(0, LOCAL_MAX_DESCRIPTION) : undefined,
  }));
}

function buildLocalUserPrompt(
  userContext: UserContext,
  events: EventSummary[],
  userMessage?: string,
): string {
  const note = userMessage?.trim().slice(0, LOCAL_MAX_NOTE);
  const userPayload = {
    locale: userContext.locale,
    city: userContext.city ?? "N/A",
    interests: userContext.interests ?? [],
    dislikedTags: userContext.dislikedTags ?? [],
    groupType: userContext.groupType ?? "any",
    indoorOutdoor: userContext.indoorOutdoor ?? "any",
  };

  const eventPayload = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    categories: event.categories,
    tags: event.tags,
  }));

  const noteSection = note
    ? `\nNote: "${note}" (preference only)`
    : "";

  return `User:${JSON.stringify(userPayload)}\nEvents:${JSON.stringify(eventPayload)}${noteSection}\nReturn JSON now.`;
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
      const userPrompt = buildLocalUserPrompt(userContext, compactEvents, userMessage);

      const result = await ctx.completion(
        {
          messages: [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: userPrompt },
          ],
          n_predict: 160,
          temperature: 0.3,
          grammar: AI_RESPONSE_GBNF,
        },
      );

      const candidateIds = new Set(compactEvents.map((e) => e.id));
      const validation = validateResponse(result.text, candidateIds);
      if (!validation.valid) {
        throw new Error(validation.error || "Response validation failed");
      }
      return validation.result!;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Local model failed: ${message}`);
    }
  }
}
