import type { z } from "zod";

import { AI_CONFIG, getOpenAIClient } from "@/lib/ai/client";
import { withRetry } from "@/lib/ai/core/retry";
import type { StructuredCompletionResult } from "@/lib/ai/core/completion";

export type VisionCompletionParams<T extends z.ZodType> = {
  system: string;
  userText: string;
  imageUrl: string;
  schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
  zodSchema: T;
  temperature?: number;
  maxTokens?: number;
};

export async function createVisionStructuredCompletion<T extends z.ZodType>(
  params: VisionCompletionParams<T>,
): Promise<StructuredCompletionResult<z.infer<T>>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  const client = getOpenAIClient();
  const startedAt = Date.now();

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: AI_CONFIG.visionModel,
      temperature: params.temperature ?? 0.4,
      max_tokens: params.maxTokens ?? 2048,
      messages: [
        { role: "system", content: params.system },
        {
          role: "user",
          content: [
            { type: "text", text: params.userText },
            {
              type: "image_url",
              image_url: { url: params.imageUrl, detail: "auto" },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: params.schema,
      },
    }),
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  const parsed = params.zodSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new Error("OPENAI_INVALID_RESPONSE");
  }

  return {
    data: parsed.data,
    model: completion.model,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
    totalTokens: completion.usage?.total_tokens ?? 0,
    latencyMs: Date.now() - startedAt,
    raw: content,
  };
}
