import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
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

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return apiSuccess({
      plan: profile?.plan ?? "FREE",
      subscription,
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/billing/subscription");
  }
}
