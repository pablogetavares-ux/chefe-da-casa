import { assertPremiumFeature } from "@/lib/billing/assert-premium";
import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteErrorWithPlanLimit } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { fetchAntiWasteSummary } from "@/lib/ai/services/anti-waste";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    await assertPremiumFeature(user.id, "Modo anti-desperdício");
    const supabase = await createClient(request);
    const summary = await fetchAntiWasteSummary(supabase, user.id);
    return apiSuccess(summary);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(
      error,
      "GET /api/v1/anti-waste/summary",
    );
  }
}
