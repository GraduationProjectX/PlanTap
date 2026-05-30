import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiKey } from "../secureKeys";
import { buildPromptPayload, buildSystemPrompt } from "../prompts";
import { validateResponse } from "../responseValidator";
import type { AiProvider, EventSummary, RecommendationResult, UserContext } from "../types";

/** Gemini free-tier: 15 RPM / 1M TPM. We retry with exponential backoff. */
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 4_000; // 4 s – generous for 15 RPM

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export class GeminiProvider implements AiProvider {
  readonly name = "Gemini";

  async generateEventRecommendations(
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ): Promise<RecommendationResult> {
    const apiKey = await getApiKey("gemini");
    if (!apiKey) throw new Error("Gemini API key not configured");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const promptPayload = buildPromptPayload(userContext, events, userMessage);
        const result = await model.generateContent([buildSystemPrompt(), promptPayload.prompt]);

        const text = await result.response.text();
        const validation = validateResponse(text, promptPayload.candidateIds);
        if (!validation.valid || !validation.result) {
          throw new Error(validation.error || "Response validation failed");
        }
        return validation.result;
      } catch (err: unknown) {
        lastError = err;
        const is429 =
          err instanceof Error &&
          (err.message.includes("429") ||
            err.message.toLowerCase().includes("resource has been exhausted") ||
            err.message.toLowerCase().includes("too many requests"));

        if (!is429 || attempt === MAX_RETRIES) throw err;

        // Exponential backoff: 4 s → 8 s → 16 s
        const delay = BASE_DELAY_MS * 2 ** attempt;
        console.warn(
          `[Gemini] 429 – retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`,
        );
        await sleep(delay);
      }
    }

    throw lastError;
  }
}
