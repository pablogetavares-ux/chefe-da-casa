import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

/**
 * Cliente OpenAI singleton — usar apenas em Server Actions / Route Handlers.
 * Nunca importar em Client Components.
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export const AI_CONFIG = {
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  visionModel: process.env.OPENAI_VISION_MODEL ?? "gpt-4o-mini",
  maxTokens: 4096,
  temperature: 0.7,
} as const;
