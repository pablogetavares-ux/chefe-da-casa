import { isUnauthorizedError } from "@/lib/api/auth";
import { mapPlanLimitError } from "@/lib/api/plan-errors";
import { apiError } from "@/lib/api/response";
import { logApiError } from "@/lib/observability/logger";

export function handleApiRouteError(
  error: unknown,
  route: string,
  fallbackMessage = "Erro interno",
) {
  if (isUnauthorizedError(error)) {
    return apiError("Não autenticado", 401, "UNAUTHORIZED");
  }

  logApiError(route, error);

  const message = error instanceof Error ? error.message : fallbackMessage;

  return apiError(message, 500);
}

export function handleApiRouteErrorWithPlanLimit(
  error: unknown,
  route: string,
) {
  const planError = mapPlanLimitError(error);
  if (planError.status !== 500) return planError;
  return handleApiRouteError(error, route);
}
