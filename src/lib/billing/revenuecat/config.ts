import { env } from "@/config/env";

export const REVENUECAT_ENTITLEMENT_PREMIUM =
  process.env.REVENUECAT_ENTITLEMENT_PREMIUM ?? "premium";

export function isRevenueCatConfigured() {
  return Boolean(env.REVENUECAT_SECRET_KEY && env.REVENUECAT_WEBHOOK_SECRET);
}

export function isRevenueCatWebhookConfigured() {
  return Boolean(env.REVENUECAT_WEBHOOK_SECRET);
}
