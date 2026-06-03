-- Expansão regional: geo nos mercados, região do usuário e catálogo para parceiros.

ALTER TABLE regional_stores
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS offer_city text,
  ADD COLUMN IF NOT EXISTS offer_state char(2),
  ADD COLUMN IF NOT EXISTS offer_search_radius_km smallint NOT NULL DEFAULT 25
    CHECK (offer_search_radius_km IN (10, 25, 50, 100));

CREATE INDEX IF NOT EXISTS regional_stores_active_idx
  ON regional_stores (is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS regional_stores_city_state_active_idx
  ON regional_stores (city, state)
  WHERE is_active = true;

-- Catálogo nacional / parceiros (leitura autenticada; escrita via service role).
CREATE TABLE IF NOT EXISTS offer_market_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_partner_id text,
  name text NOT NULL,
  chain text NOT NULL,
  city text NOT NULL,
  state char(2) NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS offer_market_catalog_partner_uidx
  ON offer_market_catalog (external_partner_id)
  WHERE external_partner_id IS NOT NULL;

ALTER TABLE offer_market_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY offer_market_catalog_select_authenticated
  ON offer_market_catalog FOR SELECT TO authenticated
  USING (is_active = true);

-- Coordenadas aproximadas por cidade (centro urbano).
UPDATE regional_stores
SET
  state = CASE city
    WHEN 'Rio de Janeiro' THEN 'RJ'
    WHEN 'Belo Horizonte' THEN 'MG'
    ELSE COALESCE(NULLIF(state, ''), 'SP')
  END,
  latitude = CASE city
    WHEN 'São Paulo' THEN -23.5505
    WHEN 'Rio de Janeiro' THEN -22.9068
    WHEN 'Belo Horizonte' THEN -19.9167
    ELSE latitude
  END,
  longitude = CASE city
    WHEN 'São Paulo' THEN -46.6333
    WHEN 'Rio de Janeiro' THEN -43.1729
    WHEN 'Belo Horizonte' THEN -43.9345
    ELSE longitude
  END,
  is_active = true
WHERE latitude IS NULL OR longitude IS NULL;
