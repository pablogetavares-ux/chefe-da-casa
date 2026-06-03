import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { isPremiumTier } from "@/lib/billing/premium";
import { getPlanLimits } from "@/lib/billing/plan-limits-core";
import { MOBILE_PLANS } from "@/config/mobile-plans";
import { createAuthClient } from "@/lib/api/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const supabase = await createAuthClient(request);

    const [{ data: profile }, { data: mobile }] = await Promise.all([
      supabase.from("profiles").select("plan").eq("id", user.id).single(),
      supabase
        .from("mobile_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    const plan = profile?.plan ?? "FREE";
    const isPremium = isPremiumTier(plan);

    return apiSuccess({
      plan,
      isPremium,
      mobileSubscription: mobile,
      limits: getPlanLimits(plan),
      plans: MOBILE_PLANS,
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/billing/mobile/status");
  }
}
