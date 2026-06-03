import { apiError, apiSuccess } from "@/lib/api/response";
import { canAccessDetailedOps } from "@/lib/api/ops-access";
import { getProductionReadiness } from "@/lib/runtime/production-readiness";

export async function GET(request: Request) {
  try {
    const readiness = getProductionReadiness();
    const timestamp = new Date().toISOString();
    const detailed = await canAccessDetailedOps(request);

    if (!detailed) {
      return apiSuccess({
        status: readiness.readyForProduction ? "ok" : "degraded",
        timestamp,
      });
    }

    return apiSuccess({
      ...readiness,
      timestamp,
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Erro ao ler status",
      500,
    );
  }
}
