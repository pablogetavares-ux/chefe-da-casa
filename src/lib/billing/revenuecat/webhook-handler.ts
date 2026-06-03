import { syncMobileSubscriptionForUser } from "@/lib/billing/revenuecat/sync";
import { verifyRevenueCatAuthorization } from "@/lib/billing/revenuecat/webhook-auth";
import { logger } from "@/lib/observability/logger";

export { verifyRevenueCatAuthorization };

type RevenueCatWebhookEvent = {
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number;
  period_type?: string;
  store?: string;
};

type RevenueCatWebhookBody = {
  api_version?: string;
  event?: RevenueCatWebhookEvent;
};

const SYNC_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TEMPORARY_ENTITLEMENT_GRANT",
  "REFUND_REVERSED",
]);

const EXPIRE_EVENT_TYPES = new Set([
  "EXPIRATION",
  "CANCELLATION",
  "BILLING_ISSUE",
]);

export async function handleRevenueCatWebhook(body: RevenueCatWebhookBody) {
  const event = body.event;
  if (!event?.app_user_id) {
    return { ok: false as const, reason: "missing_app_user_id" as const };
  }

  const userId = event.app_user_id;
  const eventType = event.type ?? "UNKNOWN";

  if (SYNC_EVENT_TYPES.has(eventType) || EXPIRE_EVENT_TYPES.has(eventType)) {
    const result = await syncMobileSubscriptionForUser(userId, {
      eventType,
    });

    logger.info("revenuecat.webhook.synced", {
      userId,
      eventType,
      isPremium: result.ok ? result.isPremium : false,
    });

    return { ok: true as const, result };
  }

  logger.info("revenuecat.webhook.ignored", { eventType, userId });
  return { ok: true as const, skipped: true as const };
}
