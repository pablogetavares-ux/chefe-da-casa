import { PLANS, type PlanId } from "@/config/plans";

export function planKeyFromTier(tier: string): PlanId {
  const normalized = tier.toLowerCase() as PlanId;
  return normalized in PLANS ? normalized : "free";
}

export function isUnlimited(limit: number) {
  return limit === -1;
}

export function getPlanLimits(planTier: string) {
  const planKey = planKeyFromTier(planTier);
  return PLANS[planKey].limits;
}

export function isAiUsageExceeded(used: number, planTier: string) {
  const limit = getPlanLimits(planTier).aiGenerationsPerMonth;
  return used >= limit;
}

export function isPantryLimitExceeded(
  currentCount: number,
  additional: number,
  planTier: string,
) {
  const limit = getPlanLimits(planTier).pantryItems;
  if (isUnlimited(limit)) return false;
  return currentCount + additional > limit;
}
