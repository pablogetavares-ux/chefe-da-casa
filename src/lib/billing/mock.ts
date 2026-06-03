import { isBillingConfigured as isStripeBillingConfigured } from "@/lib/stripe/config";
import { isStripeConfigured } from "@/lib/stripe/client";

export function isBillingMockEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  if (isStripeConfigured()) return false;

  if (process.env.BILLING_DEV_MOCK === "false") return false;
  if (process.env.BILLING_DEV_MOCK === "true") return true;
  return process.env.NODE_ENV === "development";
}

/** UI + checkout disponíveis (Stripe real ou modo demonstração). */
export function isBillingAvailable() {
  return isStripeBillingConfigured() || isBillingMockEnabled();
}

export function isBillingMockMode() {
  return isBillingMockEnabled();
}
