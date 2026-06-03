import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";
import { logger } from "@/lib/observability/logger";

export async function isRevenueCatWebhookProcessed(eventId: string) {
  if (!isAdminClientConfigured()) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("revenuecat_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  return Boolean(data);
}

export async function markRevenueCatWebhookProcessed(
  eventId: string,
  eventType: string,
) {
  if (!isAdminClientConfigured()) return;

  const admin = createAdminClient();
  const { error } = await admin.from("revenuecat_webhook_events").insert({
    id: eventId,
    event_type: eventType,
  });

  if (error && error.code !== "23505") {
    logger.warn("revenuecat.webhook.dedup_failed", {
      eventId,
      error: error.message,
    });
  }
}
