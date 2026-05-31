import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "../secureKeys";
import { buildPromptPayload, buildSystemPrompt } from "../prompts";
import { validateResponse } from "../responseValidator";
import type { AiProvider, EventSummary, RecommendationResult, UserContext } from "../types";

export class ClaudeProvider implements AiProvider {
  readonly name = "Claude";

  async generateEventRecommendations(
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ): Promise<RecommendationResult> {
    const apiKey = await getApiKey("claude");
    if (!apiKey) throw new Error("Claude API key not configured");

    const client = new Anthropic({
      apiKey,
    });

    const promptPayload = buildPromptPayload(userContext, events, userMessage);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      temperature: 0.3,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: promptPayload.prompt }],
    });

    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    if (!text) throw new Error("Unexpected response type from Claude");

    const validation = validateResponse(text, promptPayload.candidateIds);
    if (!validation.valid || !validation.result) {
      throw new Error(validation.error || "Response validation failed");
    }
    return validation.result;
  }
}
