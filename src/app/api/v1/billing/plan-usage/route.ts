import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { getPlanUsageSummary } from "@/lib/billing/plan-limits";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const summary = await getPlanUsageSummary(user.id);
    return apiSuccess(summary);
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/billing/plan-usage");
  }
}
