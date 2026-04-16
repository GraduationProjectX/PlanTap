import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "../secureKeys";
import { buildSystemPrompt, buildUserPrompt } from "../prompts";
import { safeParseRecommendation } from "../utils";
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

    // Anthropic may return structured blocks; prefer text blocks but tolerate
    // a plain string payload as well.
    const first = Array.isArray(message.content) ? message.content[0] : undefined;
    if (first && (first as any).type === "text" && typeof (first as any).text === "string") {
      return safeParseRecommendation((first as any).text);
    }

    if (typeof (message as any).content === "string") {
      return safeParseRecommendation((message as any).content);
    }

    throw new Error("Unexpected response type from Claude");
  }
}
