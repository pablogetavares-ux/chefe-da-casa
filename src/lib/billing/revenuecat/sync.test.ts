import { describe, expect, it } from "vitest";

import { parseRevenueCatPremium } from "@/lib/billing/revenuecat/parse";

describe("parseRevenueCatPremium", () => {
  it("detects active premium entitlement", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const result = parseRevenueCatPremium({
      subscriber: {
        original_app_user_id: "user-1",
        entitlements: {
          premium: {
            expires_date: future,
            grace_period_expires_date: null,
            product_identifier: "chefe_premium_monthly",
            purchase_date: new Date().toISOString(),
            period_type: "trial",
          },
        },
        subscriptions: {
          chefe_premium_monthly: {
            expires_date: future,
            store: "PLAY_STORE",
            period_type: "trial",
          },
        },
      },
    });

    expect(result.isPremium).toBe(true);
    expect(result.isTrial).toBe(true);
    expect(result.status).toBe("TRIALING");
    expect(result.store).toBe("GOOGLE_PLAY");
  });

  it("marks expired entitlement as not premium", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const result = parseRevenueCatPremium({
      subscriber: {
        original_app_user_id: "user-1",
        entitlements: {
          premium: {
            expires_date: past,
            grace_period_expires_date: null,
            product_identifier: "chefe_premium_monthly",
            purchase_date: past,
          },
        },
        subscriptions: {},
      },
    });

    expect(result.isPremium).toBe(false);
    expect(result.status).toBe("CANCELED");
  });
});
