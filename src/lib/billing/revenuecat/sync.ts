import { logPlanChange } from "@/lib/billing/audit";
import { mobilePremiumToPlanTier } from "@/lib/billing/premium";
import {
  getActiveStripePlanTier,
  resolveEffectiveProfilePlan,
} from "@/lib/billing/plan-resolution";
import {
  fetchRevenueCatSubscriber,
  type RevenueCatSubscriber,
} from "@/lib/billing/revenuecat/client";
import { REVENUECAT_ENTITLEMENT_PREMIUM } from "@/lib/billing/revenuecat/config";
import { parseRevenueCatPremium } from "@/lib/billing/revenuecat/parse";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncMobileSubscriptionForUser(
  userId: string,
  options?: {
    eventType?: string;
    subscriberPayload?: RevenueCatSubscriber;
  },
) {
  const admin = createAdminClient();
  const payload =
    options?.subscriberPayload ?? (await fetchRevenueCatSubscriber(userId));

  if (!payload) {
    return { ok: false as const, reason: "subscriber_not_found" as const };
  }

  const parsed = parseRevenueCatPremium(
    payload,
    REVENUECAT_ENTITLEMENT_PREMIUM,
  );
  const mobilePlan = mobilePremiumToPlanTier(parsed.isPremium);
  const stripePlan = await getActiveStripePlanTier(userId);
  const effectivePlan = resolveEffectiveProfilePlan(stripePlan, mobilePlan);

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const now = new Date().toISOString();

  const { error: mobileError } = await admin
    .from("mobile_subscriptions")
    .upsert(
      {
        user_id: userId,
        revenuecat_app_user_id: userId,
        entitlement_id: REVENUECAT_ENTITLEMENT_PREMIUM,
        product_id: parsed.productId,
        store: parsed.store,
        plan: mobilePlan,
        status: parsed.status,
        is_trial: parsed.isTrial,
        will_renew: parsed.willRenew,
        expires_at: parsed.expiresAt,
        current_period_start: parsed.purchaseAt,
        current_period_end: parsed.expiresAt,
        original_purchase_at: parsed.purchaseAt,
        last_event_type: options?.eventType ?? null,
        last_event_at: now,
      },
      { onConflict: "user_id" },
    );

  if (mobileError) {
    throw new Error(mobileError.message);
  }

  const profilePlan = parsed.isPremium ? effectivePlan : stripePlan;

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
      options?.eventType
        ? `revenuecat.${options.eventType}`
        : "revenuecat.sync",
      {
        mobilePlan,
        stripePlan,
        isPremium: parsed.isPremium,
      },
    );
  }

  return {
    ok: true as const,
    plan: profilePlan,
    mobilePlan,
    isPremium: parsed.isPremium,
    status: parsed.status,
    isTrial: parsed.isTrial,
    expiresAt: parsed.expiresAt,
  };
}
