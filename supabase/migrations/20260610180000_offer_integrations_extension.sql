-- Integração de ofertas com receitas, despensa, lista e perfil familiar.
-- Estrutura extensível para favoritos de produto, alertas, push, cashback e cupons (sem lógica ativa).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS offer_preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.offer_preferences IS
  'Preferências de ofertas (categorias, alertas futuros). Estrutura extensível — ver offer_extension_registry.';

CREATE TYPE public.offer_extension_status AS ENUM ('planned', 'beta', 'active');

CREATE TABLE public.offer_extension_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status public.offer_extension_status NOT NULL DEFAULT 'planned',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.offer_extension_registry IS
  'Catálogo de extensões do módulo de ofertas (roadmap técnico).';

-- Favoritos por produto (distinto de offer_favorites por oferta pontual)
CREATE TABLE public.offer_product_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_key text NOT NULL,
  display_name text NOT NULL,
  vertical_slug text NOT NULL DEFAULT 'supermarket',
  last_offer_id uuid REFERENCES public.regional_offers (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_key)
);

CREATE INDEX offer_product_watchlist_user_id_idx
  ON public.offer_product_watchlist (user_id);

-- Alertas de preço (inativos até feature launch)
CREATE TABLE public.offer_price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  watchlist_id uuid REFERENCES public.offer_product_watchlist (id) ON DELETE CASCADE,
  target_price numeric(10, 2),
  is_active boolean NOT NULL DEFAULT false,
  notify_push boolean NOT NULL DEFAULT false,
  notify_email boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX offer_price_alerts_user_id_idx
  ON public.offer_price_alerts (user_id)
  WHERE is_active = true;

-- Push (inativo até integração mobile)
CREATE TABLE public.offer_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  endpoint text,
  device_token text,
  platform text,
  is_active boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_token)
);

CREATE INDEX offer_push_subscriptions_user_id_idx
  ON public.offer_push_subscriptions (user_id)
  WHERE is_active = true;

-- Cashback (ledger futuro)
CREATE TABLE public.offer_cashback_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  offer_id uuid REFERENCES public.regional_offers (id) ON DELETE SET NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX offer_cashback_entries_user_id_idx
  ON public.offer_cashback_entries (user_id);

-- Cupons (catálogo futuro — inativos por padrão)
CREATE TABLE public.offer_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  store_id uuid REFERENCES public.regional_stores (id) ON DELETE CASCADE,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric(10, 2) NOT NULL,
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX offer_coupons_store_id_idx
  ON public.offer_coupons (store_id)
  WHERE is_active = true;

-- RLS
ALTER TABLE public.offer_extension_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_product_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_cashback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY offer_extension_registry_select_authenticated
  ON public.offer_extension_registry FOR SELECT TO authenticated
  USING (true);

CREATE POLICY offer_product_watchlist_select_own
  ON public.offer_product_watchlist FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_product_watchlist_insert_own
  ON public.offer_product_watchlist FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY offer_product_watchlist_update_own
  ON public.offer_product_watchlist FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_product_watchlist_delete_own
  ON public.offer_product_watchlist FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_price_alerts_select_own
  ON public.offer_price_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_price_alerts_insert_own
  ON public.offer_price_alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY offer_price_alerts_update_own
  ON public.offer_price_alerts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_price_alerts_delete_own
  ON public.offer_price_alerts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_push_subscriptions_select_own
  ON public.offer_push_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_push_subscriptions_insert_own
  ON public.offer_push_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY offer_push_subscriptions_update_own
  ON public.offer_push_subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_push_subscriptions_delete_own
  ON public.offer_push_subscriptions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_cashback_entries_select_own
  ON public.offer_cashback_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY offer_coupons_select_authenticated
  ON public.offer_coupons FOR SELECT TO authenticated
  USING (is_active = true);

-- Roadmap técnico (sem UI)
INSERT INTO public.offer_extension_registry (slug, name, status, metadata) VALUES
  ('product_favorites', 'Favoritos de produto', 'planned', '{"table": "offer_product_watchlist"}'::jsonb),
  ('price_alerts', 'Alertas de preço', 'planned', '{"table": "offer_price_alerts"}'::jsonb),
  ('push_notifications', 'Notificações push', 'planned', '{"table": "offer_push_subscriptions"}'::jsonb),
  ('cashback', 'Cashback', 'planned', '{"table": "offer_cashback_entries"}'::jsonb),
  ('coupons', 'Cupons', 'planned', '{"table": "offer_coupons"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
