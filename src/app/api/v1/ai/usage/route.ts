import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { getAiUsageSummary } from "@/lib/ai/limits";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const usage = await getAiUsageSummary(user.id);
    return apiSuccess(usage);
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/ai/usage");
  }
}
