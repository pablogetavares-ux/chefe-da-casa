import { resolveEffectiveProfilePlan } from "@/lib/billing/premium";
import { isActiveSubscriptionStatus } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type PlanTier = Database["public"]["Enums"]["PlanTier"];
type SubscriptionStatus = Database["public"]["Enums"]["SubscriptionStatus"];

export { resolveEffectiveProfilePlan };

export async function getActiveStripePlanTier(
  userId: string,
): Promise<PlanTier> {
  const admin = createAdminClient();
  const { data: stripeSub } = await admin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    stripeSub &&
    isActiveSubscriptionStatus(stripeSub.status as SubscriptionStatus)
  ) {
    return stripeSub.plan as PlanTier;
  }

  return "FREE";
}

export async function getActiveMobilePlanTier(
  userId: string,
): Promise<PlanTier> {
  const admin = createAdminClient();
  const { data: mobileSub } = await admin
    .from("mobile_subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    mobileSub &&
    isActiveSubscriptionStatus(mobileSub.status as SubscriptionStatus)
  ) {
    return mobileSub.plan as PlanTier;
  }

  return "FREE";
}

/** Recalcula `profiles.plan` a partir das assinaturas Stripe e mobile no banco. */
export async function reconcileProfilePlan(userId: string): Promise<PlanTier> {
  const [stripePlan, mobilePlan] = await Promise.all([
    getActiveStripePlanTier(userId),
    getActiveMobilePlanTier(userId),
  ]);

  return resolveEffectiveProfilePlan(stripePlan, mobilePlan);
}
