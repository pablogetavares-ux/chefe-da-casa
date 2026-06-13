import {
  isAdminClientConfigured,
  createAdminClient,
} from "@/lib/supabase/admin";
import { logger } from "@/lib/observability/logger";
import type { Json } from "@/types/database";

export async function isStripeWebhookProcessed(eventId: string) {
  if (!isAdminClientConfigured()) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  return Boolean(data);
}

export async function markStripeWebhookProcessed(
  eventId: string,
  eventType: string,
) {
  if (!isAdminClientConfigured()) return;

  const admin = createAdminClient();
  const { error } = await admin.from("stripe_webhook_events").insert({
    id: eventId,
    event_type: eventType,
  });

  if (error && error.code !== "23505") {
    logger.error("stripe.webhook.dedup_failed", {
      eventId,
      error: error.message,
    });
    throw new Error("STRIPE_WEBHOOK_DEDUP_FAILED");
  }
}

export async function logPlanChange(
  userId: string,
  previousPlan: string | null,
  newPlan: string,
  source: string,
  metadata?: Record<string, unknown>,
) {
  if (!isAdminClientConfigured()) return;

  const admin = createAdminClient();
  const { error } = await admin.rpc("log_plan_change", {
    p_user_id: userId,
    p_previous: (previousPlan ?? "FREE") as "FREE" | "PRO" | "FAMILY",
    p_new: newPlan as "FREE" | "PRO" | "FAMILY",
    p_source: source,
    p_metadata: (metadata ?? null) as Json | null,
  });

  if (error) {
    logger.warn("billing.plan_change_log_failed", {
      userId,
      source,
      error: error.message,
    });
  }
}
