import { initLlama, type LlamaContext } from "llama.rn";
import { buildSystemPrompt, buildUserPrompt, EVENT_IDS_GBNF } from "../prompts";
import type {
  AiProvider,
  EventSummary,
  RecommendationResult,
  UserContext,
} from "../types";

let _ctx: LlamaContext | null = null;

/**
 * Initialise (or re-use) the llama.rn context for the given model file.
 * The first call loads the model into memory which may take a few seconds.
 */
async function getContext(modelPath: string): Promise<LlamaContext> {
  if (_ctx) return _ctx;

  _ctx = await initLlama({
    model: modelPath,
    n_ctx: 2048,
    n_threads: 4,
    use_mlock: true,
  });
  return _ctx;
}

/** Release memory held by the local model. */
export async function releaseLocalModel(): Promise<void> {
  if (_ctx) {
    await _ctx.release();
    _ctx = null;
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

    return JSON.parse(result.text) as RecommendationResult;
  }
}
