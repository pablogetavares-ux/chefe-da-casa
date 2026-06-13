import type { GenerateRecipeRequest } from "@/types";
import type { GenerateRecipeResponse } from "@/lib/api/client";
import {
  ApiClientError,
  networkErrorMessage,
  timeoutErrorMessage,
} from "@/lib/api/client-errors";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

const AI_STREAM_TIMEOUT_MS = 60_000;

type StreamHandlers = {
  onStart?: (payload: { generationId: string }) => void;
  onDelta?: (payload: { text: string }) => void;
  onCached?: (payload: { recipe: GenerateRecipeResponse["recipe"] }) => void;
  onDone?: (payload: GenerateRecipeResponse) => void;
  onError?: (message: string) => void;
};

function parseSseBlock(block: string) {
  let event = "message";
  let data = "";

  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data += line.slice(5).trim();
  }

  if (!data) return null;

  try {
    return { event, data: JSON.parse(data) as unknown };
  } catch {
    return {
      event: "error",
      data: { message: "Resposta inválida do servidor" },
    };
  }
}

async function parseStreamInitError(
  response: Response,
): Promise<ApiClientError> {
  const json = (await response.json().catch(() => null)) as {
    error?: string;
    code?: string;
  } | null;

  return new ApiClientError(
    json?.error ?? "Falha ao iniciar streaming",
    json?.code,
    response.status,
  );
}

export async function streamGenerateRecipe(
  payload: GenerateRecipeRequest,
  handlers: StreamHandlers,
) {
  let response: Response;

  try {
    response = await fetch("/api/v1/ai/generate-recipe/stream", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(AI_STREAM_TIMEOUT_MS),
    });
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      const message = timeoutErrorMessage();
      handlers.onError?.(message);
      throw new ApiClientError(message, "AI_TIMEOUT");
    }

    const message = networkErrorMessage();
    handlers.onError?.(message);
    throw new ApiClientError(message, "NETWORK_ERROR");
  }

  if (response.status === 401) {
    const next = getSafeRedirectPath(window.location.pathname);
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
    throw new ApiClientError("Não autenticado", "UNAUTHORIZED", 401);
  }

  if (!response.ok || !response.body) {
    const apiError = await parseStreamInitError(response);
    handlers.onError?.(apiError.message);
    throw apiError;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let settled = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const parsed = parseSseBlock(block.trim());
      if (!parsed) continue;

      switch (parsed.event) {
        case "start":
          handlers.onStart?.(parsed.data as { generationId: string });
          break;
        case "delta":
          handlers.onDelta?.(parsed.data as { text: string });
          break;
        case "cached":
          handlers.onCached?.(
            parsed.data as { recipe: GenerateRecipeResponse["recipe"] },
          );
          break;
        case "done":
          settled = true;
          handlers.onDone?.(parsed.data as GenerateRecipeResponse);
          return;
        case "error": {
          settled = true;
          const payload = parsed.data as { message?: string; code?: string };
          const message = payload.message ?? "Erro no streaming";
          handlers.onError?.(message);
          throw new ApiClientError(message, payload.code, 500);
        }
        default:
          break;
      }
    }
  }

  if (!settled) {
    const message = "Stream encerrado antes da conclusão";
    handlers.onError?.(message);
    throw new ApiClientError(message, "AI_STREAM_INCOMPLETE");
  }
}
