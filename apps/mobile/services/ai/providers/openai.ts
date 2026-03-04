import OpenAI from "openai";
import { getApiKey } from "../secureKeys";
import { buildSystemPrompt, buildUserPrompt } from "../prompts";
import type {
  AiProvider,
  EventSummary,
  RecommendationResult,
  UserContext,
} from "../types";

export class OpenAIProvider implements AiProvider {
  readonly name = "OpenAI";

  async generateEventRecommendations(
    userContext: UserContext,
    events: EventSummary[],
    userMessage?: string,
  ): Promise<RecommendationResult> {
    const apiKey = await getApiKey("openai");
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const client = new OpenAI({
      apiKey,
      // Required for RN – disable Node-only features
      dangerouslyAllowBrowser: true,
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(userContext, events, userMessage) },
      ],
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");

    return JSON.parse(text) as RecommendationResult;
  }
}
