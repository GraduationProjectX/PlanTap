import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "../secureKeys";
import { buildSystemPrompt, buildUserPrompt } from "../prompts";
import type {
  AiProvider,
  EventSummary,
  RecommendationResult,
  UserContext,
} from "../types";

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

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      temperature: 0.3,
      system: buildSystemPrompt(),
      messages: [
        { role: "user", content: buildUserPrompt(userContext, events, userMessage) },
      ],
    });

    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type from Claude");

    return JSON.parse(block.text) as RecommendationResult;
  }
}
