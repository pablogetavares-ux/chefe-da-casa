import { env } from "@/config/env";
import type { PlanId } from "@/config/plans";
import type { Database } from "@/types/database";

type PlanTier = Database["public"]["Enums"]["PlanTier"];
type SubscriptionStatus = Database["public"]["Enums"]["SubscriptionStatus"];

export type PaidPlanId = Exclude<PlanId, "free">;

export function stripePriceIdForPlan(planId: PaidPlanId): string | null {
  if (planId === "pro") return env.STRIPE_PRICE_PRO ?? null;
  if (planId === "family") return env.STRIPE_PRICE_FAMILY ?? null;
  return null;
}

export function planTierFromStripePriceId(priceId: string): PlanTier | null {
  if (env.STRIPE_PRICE_PRO && priceId === env.STRIPE_PRICE_PRO) return "PRO";
  if (env.STRIPE_PRICE_FAMILY && priceId === env.STRIPE_PRICE_FAMILY) {
    return "FAMILY";
  }
  return null;
}

export function planTierFromPlanId(planId: PaidPlanId): PlanTier {
  return planId.toUpperCase() as PlanTier;
}

export function mapStripeSubscriptionStatus(
  status: string,
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "PAST_DUE";
    case "trialing":
      return "TRIALING";
    case "unpaid":
      return "UNPAID";
    default:
      return "INCOMPLETE";
  }
}

export function isActiveSubscriptionStatus(status: SubscriptionStatus) {
  return status === "ACTIVE" || status === "TRIALING";
}

export function isBillingConfigured() {
  return Boolean(
    env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_PRO && env.STRIPE_PRICE_FAMILY,
  );
}
