import { isBillingMockEnabled } from "@/lib/billing/mock";
import { logPlanChange } from "@/lib/billing/audit";
import { planTierFromPlanId, type PaidPlanId } from "@/lib/stripe/config";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";

export async function mockUpgradePlan(userId: string, planId: PaidPlanId) {
  if (!isBillingMockEnabled()) {
    throw new Error("Mock billing não habilitado");
  }

  if (!isAdminClientConfigured()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY necessária para mock billing");
  }

  const admin = createAdminClient();
  const planTier = planTierFromPlanId(planId);

  const { data: profile } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const { error } = await admin
    .from("profiles")
    .update({ plan: planTier, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await logPlanChange(
    userId,
    profile?.plan ?? "FREE",
    planTier,
    "mock_checkout",
    {
      planId,
    },
  );

  return { plan: planTier, userId };
}
