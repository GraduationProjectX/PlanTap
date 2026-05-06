import { initLlama, type LlamaContext } from "llama.rn";
import { buildSystemPrompt, buildUserPrompt, EVENT_IDS_GBNF } from "../prompts";
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
      if (typeof v === "number" && v > 0) return v;
    }
  } catch {
    // fallthrough
  }
  try {
    if (typeof (global as any).navigator?.hardwareConcurrency === "number") {
      return (global as any).navigator.hardwareConcurrency;
    }
  } catch {}
  return 4;
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

export class LocalProvider implements AiProvider {
  readonly name = "Local (on-device)";

  constructor(private modelPath: string) {}

  async generateEventRecommendations(
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ): Promise<RecommendationResult> {
    if (!this.modelPath) {
      throw new Error("No local model downloaded");
    }

    const ctx = await getContext(this.modelPath);

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(userContext, events, userMessage);

    const result = await ctx.completion(
      {
        messages: [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: userPrompt },
        ],
        n_predict: 256,
        temperature: 0.3,
        grammar: EVENT_IDS_GBNF,
      },
    );

    const candidateIds = new Set(events.map((e) => e.id));
    const validation = validateResponse(result.text, candidateIds);
    if (!validation.valid) {
      throw new Error(validation.error || "Response validation failed");
    }
    return validation.result!;
  }
}
