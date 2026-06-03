import type {
  RevenueCatEntitlement,
  RevenueCatSubscriber,
} from "@/lib/billing/revenuecat/client";

import type { Database } from "@/types/database";

type SubscriptionStatus = Database["public"]["Enums"]["SubscriptionStatus"];
type BillingStore = Database["public"]["Enums"]["BillingStore"];

function parseIsoDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isEntitlementActive(entitlement: RevenueCatEntitlement | undefined) {
  if (!entitlement) return false;
  if (!entitlement.expires_date) return true;
  return new Date(entitlement.expires_date).getTime() > Date.now();
}

function mapStore(store: string | undefined): BillingStore {
  switch (store?.toUpperCase()) {
    case "PLAY_STORE":
    case "GOOGLE_PLAY":
      return "GOOGLE_PLAY";
    case "APP_STORE":
      return "APP_STORE";
    case "STRIPE":
      return "STRIPE";
    case "PROMOTIONAL":
      return "PROMOTIONAL";
    default:
      return "UNKNOWN";
  }
}

function mapMobileStatus(
  isActive: boolean,
  entitlement: RevenueCatEntitlement | undefined,
): SubscriptionStatus {
  if (!isActive) return "CANCELED";
  if (entitlement?.period_type === "trial") return "TRIALING";
  if (entitlement?.billing_issues_detected_at) return "PAST_DUE";
  return "ACTIVE";
}

export function parseRevenueCatPremium(
  payload: RevenueCatSubscriber,
  entitlementId = "premium",
) {
  const entitlement = payload.subscriber.entitlements[entitlementId];
  const isPremium = isEntitlementActive(entitlement);
  const productId = entitlement?.product_identifier ?? null;
  const subscriptionEntry = productId
    ? payload.subscriber.subscriptions[productId]
    : undefined;

  return {
    isPremium,
    entitlement,
    productId,
    store: mapStore(subscriptionEntry?.store),
    status: mapMobileStatus(isPremium, entitlement),
    isTrial: entitlement?.period_type === "trial",
    willRenew: !subscriptionEntry?.unsubscribe_detected_at,
    expiresAt: parseIsoDate(entitlement?.expires_date),
    purchaseAt: parseIsoDate(entitlement?.purchase_date),
  };
}
