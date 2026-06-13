import { describe, expect, it } from "vitest";

import {
  deriveBillingHealth,
  shouldShowBillingBanner,
} from "@/lib/billing/subscription-state";
import type { Subscription } from "@/types/database";

function subscription(status: Subscription["status"]): Subscription {
  return {
    id: "sub-1",
    user_id: "user-1",
    stripe_customer_id: "cus_1",
    stripe_subscription_id: "sub_stripe",
    status,
    plan: "PRO",
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    canceled_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

describe("deriveBillingHealth", () => {
  it("flags incomplete checkout", () => {
    const health = deriveBillingHealth("FREE", subscription("INCOMPLETE"));

    expect(health.state).toBe("incomplete");
    expect(shouldShowBillingBanner(health)).toBe(true);
    expect(health.recoverable).toBe(true);
  });

  it("flags past due for premium users", () => {
    const health = deriveBillingHealth("PRO", subscription("PAST_DUE"));

    expect(health.state).toBe("past_due");
    expect(health.blocksPremiumFeatures).toBe(false);
  });

  it("flags plan mismatch when premium plan lacks subscription", () => {
    const health = deriveBillingHealth("PRO", null);

    expect(health.state).toBe("plan_mismatch");
    expect(health.recoverable).toBe(true);
  });

  it("returns none for free user without subscription", () => {
    const health = deriveBillingHealth("FREE", null);

    expect(health.state).toBe("none");
    expect(shouldShowBillingBanner(health)).toBe(false);
  });
});
