import {
  PREMIUM_RECIPE_MODES,
  type RecipeGenerationMode,
} from "@/lib/ai/constants/recipe-modes";
import { isPremiumTier } from "@/lib/billing/premium";
import { PlanLimitError } from "@/lib/billing/plan-limits";
import { getUserPlanTier } from "@/lib/billing/plan-limits";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";

async function assertSubscriptionAllowsPremium(userId: string) {
  if (!isAdminClientConfigured()) return;

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subscription?.status === "UNPAID") {
    throw new PlanLimitError(
      "Sua assinatura está suspensa. Regularize o pagamento para usar recursos premium.",
      "PREMIUM_REQUIRED",
    );
  }
}

export async function assertPremiumFeature(
  userId: string,
  featureName = "Este recurso",
) {
  const plan = await getUserPlanTier(userId);
  if (!isPremiumTier(plan)) {
    throw new PlanLimitError(
      `${featureName} está disponível no plano Premium (Pro ou Família).`,
      "PREMIUM_REQUIRED",
    );
  }

  await assertSubscriptionAllowsPremium(userId);
}

export async function assertPremiumRecipeMode(
  userId: string,
  mode: RecipeGenerationMode,
) {
  if (!PREMIUM_RECIPE_MODES.has(mode)) return;

  await assertPremiumFeature(
    userId,
    `Modo ${mode === "FITNESS" ? "fitness" : "low carb"}`,
  );
}
