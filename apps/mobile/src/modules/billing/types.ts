export type SubscriptionPhase =
  | "loading"
  | "free"
  | "premium"
  | "trial"
  | "error";

export type BillingError = {
  code: string;
  message: string;
};

export type MobileBillingStatus = {
  plan: string;
  isPremium: boolean;
  isTrial?: boolean;
  expiresAt?: string | null;
};
