import type { Database } from "@/types/database";

type PlanTier = Database["public"]["Enums"]["PlanTier"];

const TIER_RANK: Record<PlanTier, number> = {
  FREE: 0,
  PRO: 1,
  FAMILY: 2,
};

export function isPremiumTier(plan: string) {
  return plan === "PRO" || plan === "FAMILY";
}

export function maxPlanTier(a: PlanTier, b: PlanTier): PlanTier {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}

/** Plano efetivo combinando tiers Stripe e mobile. */
export function resolveEffectiveProfilePlan(
  stripePlan: PlanTier,
  mobilePlan: PlanTier,
): PlanTier {
  return maxPlanTier(stripePlan, mobilePlan);
}

export function mobilePremiumToPlanTier(isPremium: boolean): PlanTier {
  return isPremium ? "PRO" : "FREE";
}
