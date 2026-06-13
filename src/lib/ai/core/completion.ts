import type OpenAI from "openai";
import type { z } from "zod";

import { AI_CONFIG, getOpenAIClient } from "@/lib/ai/client";
import { createOpenAiAbortSignal } from "@/lib/ai/core/openai-timeout";
import { withRetry } from "@/lib/ai/core/retry";

export type StructuredCompletionParams<T extends z.ZodType> = {
  system: string;
  user: string;
  schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
  zodSchema: T;
  temperature?: number;
  maxTokens?: number;
};

export type StructuredCompletionResult<T> = {
  data: T;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  raw: string;
};

export async function createStructuredCompletion<T extends z.ZodType>(
  params: StructuredCompletionParams<T>,
): Promise<StructuredCompletionResult<z.infer<T>>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  const client = getOpenAIClient();
  const startedAt = Date.now();

  const completion = await withRetry(() =>
    client.chat.completions.create(
      {
        model: AI_CONFIG.model,
        temperature: params.temperature ?? AI_CONFIG.temperature,
        max_tokens: params.maxTokens ?? AI_CONFIG.maxTokens,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: params.schema,
        },
      },
      { signal: createOpenAiAbortSignal() },
    ),
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    throw new Error("OPENAI_INVALID_RESPONSE");
  }

  const parsed = params.zodSchema.safeParse(parsedJson);
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

export type StreamHandlers = {
  onDelta?: (chunk: string, fullText: string) => void;
  onDone?: (fullText: string) => void;
};

export async function createStructuredCompletionStream<T extends z.ZodType>(
  params: StructuredCompletionParams<T>,
  handlers: StreamHandlers = {},
): Promise<StructuredCompletionResult<z.infer<T>>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  const client = getOpenAIClient();
  const startedAt = Date.now();

  const stream = await withRetry(() =>
    client.chat.completions.create(
      {
        model: AI_CONFIG.model,
        temperature: params.temperature ?? AI_CONFIG.temperature,
        max_tokens: params.maxTokens ?? AI_CONFIG.maxTokens,
        stream: true,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: params.schema,
        },
      },
      { signal: createOpenAiAbortSignal() },
    ),
  );

  let fullText = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (!delta) continue;
    fullText += delta;
    handlers.onDelta?.(delta, fullText);
  }

  handlers.onDone?.(fullText);

  if (!fullText) {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  const parsed = params.zodSchema.safeParse(JSON.parse(fullText));
  if (!parsed.success) {
    throw new Error("OPENAI_INVALID_RESPONSE");
  }

  return {
    data: parsed.data,
    model: AI_CONFIG.model,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    latencyMs: Date.now() - startedAt,
    raw: fullText,
  };
}

export function createSseStream(
  handler: (send: (event: string, data: unknown) => void) => Promise<void>,
) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        await handler(send);
        controller.close();
      } catch (error) {
        send("error", {
          message:
            error instanceof Error && error.message === "AI_TIMEOUT"
              ? "A geração demorou demais. Tente novamente."
              : "Falha na operação de IA. Tente novamente.",
          code:
            error instanceof Error && error.message === "AI_TIMEOUT"
              ? "AI_TIMEOUT"
              : "AI_ERROR",
        });
        controller.close();
      }
    },
  });
}

export function sseResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export type OpenAIChatMessage = OpenAI.Chat.ChatCompletionMessageParam;
