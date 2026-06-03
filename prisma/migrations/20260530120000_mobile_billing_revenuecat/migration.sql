-- Mobile billing (RevenueCat + Google Play / App Store)
-- Applied remotely via Supabase MCP (mobile_billing_revenuecat).

CREATE TYPE "BillingStore" AS ENUM ('GOOGLE_PLAY', 'APP_STORE', 'STRIPE', 'PROMOTIONAL', 'UNKNOWN');

CREATE TABLE public.mobile_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  revenuecat_app_user_id text NOT NULL UNIQUE,
  entitlement_id text NOT NULL DEFAULT 'premium',
  product_id text,
  store "BillingStore" NOT NULL DEFAULT 'GOOGLE_PLAY',
  plan "PlanTier" NOT NULL DEFAULT 'FREE',
  status "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  is_trial boolean NOT NULL DEFAULT false,
  will_renew boolean NOT NULL DEFAULT true,
  current_period_start timestamptz,
  current_period_end timestamptz,
  expires_at timestamptz,
  original_purchase_at timestamptz,
  last_event_type text,
  last_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX mobile_subscriptions_user_id_status_idx
  ON public.mobile_subscriptions(user_id, status);

CREATE TABLE public.revenuecat_webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mobile_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY mobile_subscriptions_select_own ON public.mobile_subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
