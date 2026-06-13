import { ZodError } from "zod";

import { isUnauthorizedError } from "@/lib/api/auth";
import { mapPlanLimitError } from "@/lib/api/plan-errors";
import { apiError } from "@/lib/api/response";
import { logApiError } from "@/lib/observability/logger";

function isPostgrestError(
  error: unknown,
): error is { message: string; code?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    "code" in error
  );
}

function clientSafeMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ZodError) {
    return "Parâmetros inválidos";
  }
  if (isUnauthorizedError(error)) {
    return "Não autenticado";
  }
  if (error instanceof Error) {
    const msg = error.message;
    if (
      msg === "UNAUTHORIZED" ||
      msg === "RATE_LIMIT_EXCEEDED" ||
      msg.startsWith("PLAN_LIMIT") ||
      msg.startsWith("PREMIUM_REQUIRED")
    ) {
      return msg;
    }
  }
  return fallbackMessage;
}

export function handleApiRouteError(
  error: unknown,
  route: string,
  fallbackMessage = "Erro interno",
) {
  if (isUnauthorizedError(error)) {
    return apiError("Não autenticado", 401, "UNAUTHORIZED");
  }

  if (error instanceof ZodError) {
    logApiError(route, error);
    return apiError("Parâmetros inválidos", 400, "VALIDATION_ERROR");
  }

  if (error instanceof Error) {
    if (error.message.startsWith("EXPORT_PARTIAL_FAILURE")) {
      logApiError(route, error);
      return apiError(
        "Não foi possível exportar todos os dados. Tente novamente.",
        503,
        "EXPORT_INCOMPLETE",
      );
    }
    if (error.message.startsWith("DELETE_")) {
      logApiError(route, error);
      return apiError(
        "Não foi possível excluir a conta completamente. Tente novamente ou contate o suporte.",
        503,
        "DELETE_INCOMPLETE",
      );
    }
  }

  logApiError(route, error);

  if (isPostgrestError(error)) {
    return apiError(fallbackMessage, 500, "DATABASE_ERROR");
  }

  const message = clientSafeMessage(error, fallbackMessage);
  const status =
    error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED"
      ? 429
      : 500;

  return apiError(message, status);
}

export function handleApiRouteErrorWithPlanLimit(
  error: unknown,
  route: string,
) {
  const planError = mapPlanLimitError(error);
  if (planError.status !== 500) return planError;
  return handleApiRouteError(error, route);
}
