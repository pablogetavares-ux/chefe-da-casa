import { env } from "@/config/env";

export type RevenueCatEntitlement = {
  expires_date: string | null;
  grace_period_expires_date: string | null;
  product_identifier: string | null;
  purchase_date: string | null;
  period_type?: string;
  billing_issues_detected_at?: string | null;
};

export type RevenueCatSubscriber = {
  subscriber: {
    original_app_user_id: string;
    entitlements: Record<string, RevenueCatEntitlement>;
    subscriptions: Record<
      string,
      {
        expires_date: string | null;
        store: string;
        period_type?: string;
        unsubscribe_detected_at?: string | null;
        billing_issues_detected_at?: string | null;
      }
    >;
  };
};

export async function fetchRevenueCatSubscriber(
  appUserId: string,
): Promise<RevenueCatSubscriber | null> {
  const secret = env.REVENUECAT_SECRET_KEY;
  if (!secret) return null;

  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RevenueCat API ${response.status}: ${text}`);
  }

  return (await response.json()) as RevenueCatSubscriber;
}
