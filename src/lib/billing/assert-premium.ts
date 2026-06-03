import { isPremiumTier } from "@/lib/billing/premium";
import { PlanLimitError } from "@/lib/billing/plan-limits";
import { getUserPlanTier } from "@/lib/billing/plan-limits";

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
}
