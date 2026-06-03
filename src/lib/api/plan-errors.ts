import { apiError, apiSuccess } from "@/lib/api/response";
import { PlanLimitError } from "@/lib/billing/plan-limits";

export function mapPlanLimitError(error: unknown) {
  if (error instanceof PlanLimitError) {
    const status = error.code === "PREMIUM_REQUIRED" ? 403 : 429;
    return apiError(error.message, status, error.code);
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return apiError("Não autenticado", 401, "UNAUTHORIZED");
  }
  return apiError(error instanceof Error ? error.message : "Erro interno", 500);
}

export { apiSuccess };
