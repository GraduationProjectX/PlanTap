// Unified AI service entry-point.


export {
  type AiProvider,
  type EventSummary,
  type RecommendationResult,
  type UserContext,
} from "./types";
export { getApiKey, setApiKey, clearApiKey } from "./secureKeys";
export { releaseLocalModel } from "./providers/local";

import { useAiStore } from "@/stores/ai-store";
import type { AiProvider, EventSummary, RecommendationResult, UserContext } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { OpenAIProvider } from "./providers/openai";
import { ClaudeProvider } from "./providers/claude";
import { LocalProvider } from "./providers/local";


export function getProvider(): AiProvider {
  const { provider, localModelPath } = useAiStore.getState();

  switch (provider) {
    case "gemini":
      return new GeminiProvider();
    case "openai":
      return new OpenAIProvider();
    case "claude":
      return new ClaudeProvider();
    case "local":
      if (!localModelPath) throw new Error("No local model downloaded");
      return new LocalProvider(localModelPath);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}


export async function getRecommendations(
  userContext: UserContext,
  events: EventSummary[],
  userMessage?: string,
): Promise<RecommendationResult> {
  const provider = getProvider();
  return provider.generateEventRecommendations(userContext, events, userMessage);
}
