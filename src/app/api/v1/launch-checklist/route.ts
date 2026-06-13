import { requireAuthUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { isAdminEmail } from "@/lib/auth/admin";
import { getLaunchReadiness } from "@/lib/runtime/launch-readiness";

/** Checklist de go-live — público em dev; admin-only em produção. */
export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      const user = await requireAuthUser(request);
      if (!isAdminEmail(user.email)) {
        return apiError("Acesso negado", 403, "FORBIDDEN");
      }
    }

    const launch = getLaunchReadiness();
    return apiSuccess({
      ...launch,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/launch-checklist");
  }
}
