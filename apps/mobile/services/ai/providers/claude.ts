import Anthropic from "@anthropic-ai/sdk";
import { getApiKey } from "../secureKeys";
import { buildSystemPrompt, buildUserPrompt } from "../prompts";
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

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      temperature: 0.3,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(userContext, events, userMessage) }],
    });

    // Anthropic may return structured blocks; prefer text blocks but tolerate
    // a plain string payload as well.
    let text: string | undefined;
    const first = Array.isArray(message.content) ? message.content[0] : undefined;
    if (first && (first as any).type === "text" && typeof (first as any).text === "string") {
      text = (first as any).text;
    } else if (typeof (message as any).content === "string") {
      text = (message as any).content;
    }

    if (!text) throw new Error("Unexpected response type from Claude");

    const candidateIds = new Set(events.map((e) => e.id));
    const validation = validateResponse(text, candidateIds);
    if (!validation.valid) {
      throw new Error(validation.error || "Response validation failed");
    }
    return validation.result!;
  }
}
