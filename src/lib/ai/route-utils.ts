import { apiError } from "@/lib/api/response";
import { logApiError } from "@/lib/observability/logger";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { isAiMockEnabled, isOpenAiConfigured } from "@/lib/ai/mock";
import { PlanLimitError } from "@/lib/billing/plan-limits";

export function mapAiRouteError(error: unknown, route = "ai") {
  if (error instanceof PlanLimitError) {
    const status = error.code === "PREMIUM_REQUIRED" ? 403 : 429;
    return apiError(error.message, status, error.code);
  }

  if (!(error instanceof Error)) {
    logApiError(route, error);
    return apiError("Falha na operação de IA. Tente novamente.", 500);
  }

  switch (error.message) {
    case "UNAUTHORIZED":
      return apiError("Não autenticado", 401, "UNAUTHORIZED");
    case "FORBIDDEN":
      return apiError("Origem não permitida", 403, "FORBIDDEN");
    case "SUPABASE_SERVICE_ROLE_KEY não configurada":
      return apiError(
        "Servidor não configurado para registrar uso de IA. Adicione SUPABASE_SERVICE_ROLE_KEY.",
        503,
        "SERVICE_ROLE_MISSING",
      );
    case "AI_LIMIT_REACHED":
      return apiError(
        "Limite mensal de gerações atingido. Faça upgrade do plano.",
        429,
        "AI_LIMIT_REACHED",
      );
    case "OPENAI_NOT_CONFIGURED":
      return apiError(
        "Serviço de IA não configurado. Adicione OPENAI_API_KEY no .env.",
        503,
        "OPENAI_NOT_CONFIGURED",
      );
    case "RECIPE_NOT_FOUND":
      return apiError("Receita não encontrada", 404, "RECIPE_NOT_FOUND");
    case "AI_RATE_LIMIT":
      return apiError(
        "Muitas requisições de IA. Aguarde um minuto e tente novamente.",
        429,
        "AI_RATE_LIMIT",
      );
    case "AI_TIMEOUT":
      return apiError(
        "A geração demorou demais. Tente novamente com menos ingredientes ou mais tarde.",
        504,
        "AI_TIMEOUT",
      );
    case "INVALID_IMAGE_TYPE":
      return apiError(
        "Formato de imagem inválido. Use JPEG, PNG ou WebP.",
        400,
        "INVALID_IMAGE_TYPE",
      );
    case "IMAGE_TOO_LARGE":
      return apiError(
        "Imagem muito grande. Máximo 5 MB.",
        400,
        "IMAGE_TOO_LARGE",
      );
    case "SCAN_FAILED":
      return apiError(
        "Não foi possível reconhecer ingredientes na imagem. Tente outra foto com boa iluminação.",
        422,
        "SCAN_FAILED",
      );
    case "OPENAI_EMPTY_RESPONSE":
    case "OPENAI_INVALID_RESPONSE":
      return apiError(
        "Resposta inválida da IA. Tente novamente.",
        502,
        "AI_INVALID_RESPONSE",
      );
    case "Mensagem vazia":
      return apiError("Mensagem vazia", 400, "VALIDATION_ERROR");
    default:
      if (error.name === "ZodError") {
        return apiError("Dados inválidos", 400, "VALIDATION_ERROR");
      }
      logApiError(route, error);
      return apiError("Falha na operação de IA. Tente novamente.", 500);
  }
}

export function ensureOpenAiConfigured() {
  if (isAiMockEnabled() || isOpenAiConfigured()) return;
  throw new Error("OPENAI_NOT_CONFIGURED");
}

export { isAiMockEnabled, isOpenAiConfigured };

export async function assertAiRateLimit(userId: string) {
  const result = await checkRateLimit(`ai:${userId}`);
  if (!result.allowed) {
    throw new Error("AI_RATE_LIMIT");
  }
}
