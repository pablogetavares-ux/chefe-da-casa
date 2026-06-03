-- Regional offers module (mirrors MCP migration regional_offers_module)
CREATE TYPE "OfferCategory" AS ENUM (
  'MEAT',
  'PRODUCE',
  'DAIRY',
  'BAKERY',
  'BEVERAGES',
  'FROZEN',
  'PANTRY',
  'CLEANING',
  'OTHER'
);

CREATE TABLE regional_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chain text NOT NULL,
  city text NOT NULL,
  state text NOT NULL DEFAULT 'SP',
  neighborhood text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE regional_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES regional_stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category "OfferCategory" NOT NULL DEFAULT 'OTHER',
  product_name text NOT NULL,
  current_price numeric(10, 2) NOT NULL CHECK (current_price >= 0),
  previous_price numeric(10, 2) CHECK (previous_price IS NULL OR previous_price >= current_price),
  unit text,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  image_url text,
  ingredient_keywords text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE offer_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES regional_offers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, offer_id)
);

CREATE INDEX regional_offers_store_id_idx ON regional_offers(store_id);
CREATE INDEX regional_offers_category_idx ON regional_offers(category);
CREATE INDEX regional_offers_active_valid_idx ON regional_offers(valid_until)
  WHERE is_active = true;
CREATE INDEX regional_stores_city_state_idx ON regional_stores(city, state);
CREATE INDEX offer_favorites_user_id_idx ON offer_favorites(user_id);

ALTER TABLE regional_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY regional_stores_select_authenticated
  ON regional_stores FOR SELECT TO authenticated USING (true);

CREATE POLICY regional_offers_select_active
  ON regional_offers FOR SELECT TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE POLICY offer_favorites_select_own
  ON offer_favorites FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY offer_favorites_insert_own
  ON offer_favorites FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY offer_favorites_delete_own
  ON offer_favorites FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
