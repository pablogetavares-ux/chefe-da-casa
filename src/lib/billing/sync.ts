import type Stripe from "stripe";

import { logPlanChange } from "@/lib/billing/audit";
import {
  getActiveMobilePlanTier,
  reconcileProfilePlan,
  resolveEffectiveProfilePlan,
} from "@/lib/billing/plan-resolution";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isActiveSubscriptionStatus,
  mapStripeSubscriptionStatus,
  planTierFromStripePriceId,
} from "@/lib/stripe/config";

function resolveUserId(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
) {
  return subscription.metadata.userId ?? fallbackUserId ?? null;
}

function resolvePlanTier(subscription: Stripe.Subscription) {
  const metadataPlan = subscription.metadata.plan?.toUpperCase();
  if (metadataPlan === "PRO" || metadataPlan === "FAMILY") {
    return metadataPlan;
  }

  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return null;

  return planTierFromStripePriceId(priceId);
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
) {
  const userId = resolveUserId(subscription, fallbackUserId);
  const plan = resolvePlanTier(subscription);

  if (!userId || !plan) {
    return { ok: false as const, reason: "missing_user_or_plan" as const };
  }

  const admin = createAdminClient();
  const status = mapStripeSubscriptionStatus(subscription.status);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const firstItem = subscription.items.data[0];
  const periodStart = firstItem?.current_period_start;
  const periodEnd = firstItem?.current_period_end;

  const { error: subscriptionError } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan,
      status,
      current_period_start: periodStart
        ? new Date(periodStart * 1000).toISOString()
        : null,
      current_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (subscriptionError) {
    throw new Error(subscriptionError.message);
  }

  const stripePlan = isActiveSubscriptionStatus(status) ? plan : "FREE";
  const mobilePlan = await getActiveMobilePlanTier(userId);
  const profilePlan = resolveEffectiveProfilePlan(stripePlan, mobilePlan);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ plan: profilePlan })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (existingProfile?.plan !== profilePlan) {
    await logPlanChange(
      userId,
      existingProfile?.plan ?? "FREE",
      profilePlan,
      "stripe.sync",
      {
        subscriptionId: subscription.id,
        status,
      },
    );
  }

  return { ok: true as const, userId, plan: profilePlan, status };
}

export async function downgradeUserToFree(
  userId: string,
  source = "stripe.downgrade",
) {
  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const profilePlan = await reconcileProfilePlan(userId);

  const { error: profileError } = await admin
    .from("profiles")
    .update({ plan: profilePlan })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (existingProfile?.plan !== profilePlan) {
    await logPlanChange(
      userId,
      existingProfile?.plan ?? "FREE",
      profilePlan,
      source,
    );
  }
}
