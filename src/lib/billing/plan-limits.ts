import { createClient } from "@/lib/supabase/server";
import { getMonthStartIso } from "@/lib/utils/date";
import { getPlanLimits, isUnlimited } from "@/lib/billing/plan-limits-core";

/** PENDING recentes reservam slot de quota; mais antigos não bloqueiam indefinidamente. */
const PENDING_QUOTA_WINDOW_MS = 15 * 60 * 1000;

function pendingQuotaCutoffIso() {
  return new Date(Date.now() - PENDING_QUOTA_WINDOW_MS).toISOString();
}

export {
  getPlanLimits,
  isUnlimited,
  planKeyFromTier,
} from "@/lib/billing/plan-limits-core";

export type PlanLimitKey =
  | "aiGenerationsPerMonth"
  | "recipesPerMonth"
  | "savedRecipes"
  | "pantryItems";

export class PlanLimitError extends Error {
  constructor(
    message: string,
    public code:
      | "AI_LIMIT_REACHED"
      | "PANTRY_LIMIT_REACHED"
      | "FAVORITES_LIMIT_REACHED"
      | "RECIPES_LIMIT_REACHED"
      | "PREMIUM_REQUIRED",
  ) {
    super(message);
    this.name = "PlanLimitError";
  }
}

export async function getUserPlanTier(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  return profile?.plan ?? "FREE";
}

/** Gerações via ai_generations; chat via usage_logs (sem dupla contagem). */
export async function getMonthlyAiUsage(
  userId: string,
  supabaseClient?: Awaited<ReturnType<typeof createClient>>,
) {
  const supabase = supabaseClient ?? (await createClient());
  const monthStart = getMonthStartIso();
  const pendingCutoff = pendingQuotaCutoffIso();

  const [
    { count: completedCount },
    { count: pendingCount },
    { count: chatCount },
  ] = await Promise.all([
    supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .eq("status", "COMPLETED"),
    supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .eq("status", "PENDING")
      .gte("created_at", pendingCutoff),
    supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .eq("action", "ai.chat"),
  ]);

  return (completedCount ?? 0) + (pendingCount ?? 0) + (chatCount ?? 0);
}

export type AiUsageSummary = {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
};

export async function getAiUsageSummary(
  userId: string,
  planTier?: string,
  supabaseClient?: Awaited<ReturnType<typeof createClient>>,
): Promise<AiUsageSummary> {
  const tier = planTier ?? (await getUserPlanTier(userId));
  const limits = getPlanLimits(tier);
  const used = await getMonthlyAiUsage(userId, supabaseClient);

  return {
    used,
    limit: limits.aiGenerationsPerMonth,
    remaining: Math.max(limits.aiGenerationsPerMonth - used, 0),
    plan: tier,
  };
}

export async function assertAiGenerationAllowed(userId: string) {
  const usage = await getAiUsageSummary(userId);
  if (usage.used >= usage.limit) {
    throw new PlanLimitError(
      "Limite mensal de IA atingido. Faça upgrade do plano.",
      "AI_LIMIT_REACHED",
    );
  }
  return usage;
}

export async function assertPantryLimit(userId: string, additional = 1) {
  const planTier = await getUserPlanTier(userId);
  const limit = getPlanLimits(planTier).pantryItems;
  if (isUnlimited(limit)) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("pantry_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) + additional > limit) {
    throw new PlanLimitError(
      `Limite de ${limit} itens na despensa atingido. Faça upgrade do plano.`,
      "PANTRY_LIMIT_REACHED",
    );
  }
}

export async function assertFavoritesLimit(userId: string) {
  const planTier = await getUserPlanTier(userId);
  const limit = getPlanLimits(planTier).savedRecipes;
  if (isUnlimited(limit)) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) >= limit) {
    throw new PlanLimitError(
      `Limite de ${limit} receitas favoritas atingido. Faça upgrade do plano.`,
      "FAVORITES_LIMIT_REACHED",
    );
  }
}

export async function assertRecipesPerMonthLimit(userId: string) {
  const planTier = await getUserPlanTier(userId);
  const limit = getPlanLimits(planTier).recipesPerMonth;
  if (isUnlimited(limit)) return;

  const supabase = await createClient();
  const { count } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", getMonthStartIso());

  if ((count ?? 0) >= limit) {
    throw new PlanLimitError(
      `Limite de ${limit} receitas por mês atingido. Faça upgrade do plano.`,
      "RECIPES_LIMIT_REACHED",
    );
  }
}

export async function getPlanUsageSummary(userId: string) {
  const supabase = await createClient();
  const planTier = await getUserPlanTier(userId);
  const limits = getPlanLimits(planTier);
  const monthStart = getMonthStartIso();

  const [
    { count: generationCount },
    { count: chatCount },
    { count: pantryCount },
    { count: favoritesCount },
    { count: recipesThisMonth },
  ] = await Promise.all([
    supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .in("status", ["COMPLETED"]),
    supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart)
      .eq("action", "ai.chat"),
    supabase
      .from("pantry_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("recipes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart),
  ]);

  const aiUsed = (generationCount ?? 0) + (chatCount ?? 0);

  return {
    plan: planTier,
    ai: {
      used: aiUsed,
      limit: limits.aiGenerationsPerMonth,
      remaining: Math.max(limits.aiGenerationsPerMonth - aiUsed, 0),
      plan: planTier,
    },
    pantry: {
      used: pantryCount ?? 0,
      limit: limits.pantryItems,
    },
    favorites: {
      used: favoritesCount ?? 0,
      limit: limits.savedRecipes,
    },
    recipes: {
      used: recipesThisMonth ?? 0,
      limit: limits.recipesPerMonth,
    },
  };
}
