import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { deriveBillingHealth } from "@/lib/billing/subscription-state";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const plan = profile?.plan ?? "FREE";

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const billingHealth = deriveBillingHealth(plan, subscription);

    return apiSuccess({
      plan,
      subscription,
      billingHealth,
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/billing/subscription");
  }
}
