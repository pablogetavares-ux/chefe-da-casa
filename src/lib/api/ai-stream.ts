import type { GenerateRecipeRequest } from "@/types";
import type { GenerateRecipeResponse } from "@/lib/api/client";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

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

export async function streamGenerateRecipe(
  payload: GenerateRecipeRequest,
  handlers: StreamHandlers,
) {
  const response = await fetch("/api/v1/ai/generate-recipe/stream", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    const next = getSafeRedirectPath(window.location.pathname);
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
    throw new Error("Não autenticado");
  }

  if (!response.ok || !response.body) {
    const json = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(json?.error ?? "Falha ao iniciar streaming");
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
        case "error":
          settled = true;
          handlers.onError?.(
            (parsed.data as { message?: string }).message ??
              "Erro no streaming",
          );
          return;
        default:
          break;
      }
    }
  }

  if (!settled) {
    handlers.onError?.("Stream encerrado antes da conclusão");
  }
}
