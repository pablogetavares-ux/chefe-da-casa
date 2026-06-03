import type { SupabaseClient } from "@supabase/supabase-js";

import { getPlanLimits } from "@/lib/billing/plan-limits";
import { getMonthStartIso } from "@/lib/utils/date";
import type { Database } from "@/types/database";

export type DashboardStats = {
  firstName: string;
  plan: string;
  pantryCount: number;
  recipeCount: number;
  shoppingPendingCount: number;
  favoritesCount: number;
  aiRemaining: number;
};

/** Uma rodada paralela de queries — reutiliza o client Supabase do request. */
export async function fetchDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardStats> {
  const monthStart = getMonthStartIso();

  const [
    { count: pantryCount },
    { count: recipeCount },
    { count: shoppingPendingCount },
    { count: favoritesCount },
    { data: profile },
    { count: generationCount },
    { count: chatCount },
  ] = await Promise.all([
    supabase
      .from("pantry_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("recipes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("shopping_list_items")
      .select("id, shopping_lists!inner(user_id)", {
        count: "exact",
        head: true,
      })
      .eq("shopping_lists.user_id", userId)
      .eq("is_checked", false),
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("profiles")
      .select("full_name, plan")
      .eq("id", userId)
      .single(),
    supabase
      .from("ai_generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .in("status", ["COMPLETED"]),
    supabase
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .eq("action", "ai.chat"),
  ]);

  const planTier = profile?.plan ?? "FREE";
  const limits = getPlanLimits(planTier);
  const aiUsed = (generationCount ?? 0) + (chatCount ?? 0);

  return {
    firstName: profile?.full_name?.split(" ")[0] ?? "Chef",
    plan: planTier,
    pantryCount: pantryCount ?? 0,
    recipeCount: recipeCount ?? 0,
    shoppingPendingCount: shoppingPendingCount ?? 0,
    favoritesCount: favoritesCount ?? 0,
    aiRemaining: Math.max(limits.aiGenerationsPerMonth - aiUsed, 0),
  };
}
