-- Central Multi-Ofertas: verticais de mercado + categorias dinâmicas.
-- Preserva enum OfferCategory e coluna regional_offers.category (compatibilidade).

CREATE TABLE IF NOT EXISTS offer_verticals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  icon_key text,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offer_verticals_slug_chk CHECK (slug ~ '^[a-z][a-z0-9_]*$')
);

CREATE UNIQUE INDEX IF NOT EXISTS offer_verticals_slug_uidx ON offer_verticals (slug);

CREATE TABLE IF NOT EXISTS offer_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id uuid NOT NULL REFERENCES offer_verticals (id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  legacy_enum "OfferCategory",
  parent_id uuid REFERENCES offer_categories (id) ON DELETE SET NULL,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offer_categories_slug_chk CHECK (slug ~ '^[a-z][a-z0-9_]*$'),
  UNIQUE (vertical_id, slug)
);

CREATE INDEX IF NOT EXISTS offer_categories_vertical_id_idx
  ON offer_categories (vertical_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS offer_categories_legacy_enum_idx
  ON offer_categories (legacy_enum)
  WHERE legacy_enum IS NOT NULL;

ALTER TABLE regional_stores
  ADD COLUMN IF NOT EXISTS vertical_id uuid REFERENCES offer_verticals (id) ON DELETE RESTRICT;

ALTER TABLE regional_offers
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES offer_categories (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS regional_stores_vertical_id_idx
  ON regional_stores (vertical_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS regional_offers_category_id_idx
  ON regional_offers (category_id)
  WHERE is_active = true;

-- ─── Seed verticais ─────────────────────────────────────────────────────────

INSERT INTO offer_verticals (slug, name, icon_key, sort_order, is_active)
VALUES
  ('supermarket', 'Supermercados', 'shopping-cart', 1, true),
  ('pharmacy', 'Farmácias', 'pill', 2, false),
  ('pet_shop', 'Pet shop', 'paw-print', 3, false),
  ('clothing', 'Roupas', 'shirt', 4, false),
  ('footwear', 'Calçados', 'footprints', 5, false),
  ('construction', 'Construção', 'hammer', 6, false),
  ('electronics', 'Eletrônicos', 'cpu', 7, false),
  ('services', 'Serviços', 'wrench', 8, false)
ON CONFLICT (slug) DO NOTHING;

-- Categorias do supermercado (mapeamento do enum legado)
INSERT INTO offer_categories (vertical_id, slug, name, legacy_enum, sort_order)
SELECT v.id, x.slug, x.name, x.legacy_enum::"OfferCategory", x.sort_order
FROM offer_verticals v
CROSS JOIN (
  VALUES
    ('meat', 'Carnes e peixes', 'MEAT', 1),
    ('produce', 'Frutas e verduras', 'PRODUCE', 2),
    ('dairy', 'Laticínios', 'DAIRY', 3),
    ('bakery', 'Padaria', 'BAKERY', 4),
    ('beverages', 'Bebidas', 'BEVERAGES', 5),
    ('frozen', 'Congelados', 'FROZEN', 6),
    ('pantry', 'Mercearia', 'PANTRY', 7),
    ('cleaning', 'Limpeza', 'CLEANING', 8),
    ('other', 'Outros', 'OTHER', 9)
) AS x (slug, name, legacy_enum, sort_order)
WHERE v.slug = 'supermarket'
ON CONFLICT (vertical_id, slug) DO NOTHING;

-- Placeholders para verticais futuras (inativas — sem ofertas ainda)
INSERT INTO offer_categories (vertical_id, slug, name, sort_order, is_active)
SELECT v.id, x.slug, x.name, x.sort_order, false
FROM offer_verticals v
CROSS JOIN (
  VALUES
    ('general', 'Geral', 1)
) AS x (slug, name, sort_order)
WHERE v.slug IN (
  'pharmacy', 'pet_shop', 'clothing', 'footwear',
  'construction', 'electronics', 'services'
)
ON CONFLICT (vertical_id, slug) DO NOTHING;

-- Backfill lojas e ofertas existentes (supermercado)
UPDATE regional_stores rs
SET vertical_id = v.id
FROM offer_verticals v
WHERE v.slug = 'supermarket'
  AND rs.vertical_id IS NULL;

UPDATE regional_offers ro
SET category_id = oc.id
FROM offer_categories oc
JOIN offer_verticals v ON v.id = oc.vertical_id
WHERE v.slug = 'supermarket'
  AND oc.legacy_enum = ro.category
  AND ro.category_id IS NULL;

-- Sincroniza enum legado quando category_id é definido (fonte de verdade: catálogo)
CREATE OR REPLACE FUNCTION sync_regional_offer_legacy_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    SELECT legacy_enum INTO NEW.category
    FROM offer_categories
    WHERE id = NEW.category_id;
    IF NEW.category IS NULL THEN
      NEW.category := 'OTHER';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS regional_offers_sync_legacy_category ON regional_offers;
CREATE TRIGGER regional_offers_sync_legacy_category
  BEFORE INSERT OR UPDATE OF category_id ON regional_offers
  FOR EACH ROW
  EXECUTE FUNCTION sync_regional_offer_legacy_category();

REVOKE ALL ON FUNCTION public.sync_regional_offer_legacy_category() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_regional_offer_legacy_category() FROM anon;
REVOKE ALL ON FUNCTION public.sync_regional_offer_legacy_category() FROM authenticated;

-- RLS: catálogo somente leitura para usuários autenticados
ALTER TABLE offer_verticals ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offer_verticals_select_authenticated ON offer_verticals;
CREATE POLICY offer_verticals_select_authenticated
  ON offer_verticals FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS offer_categories_select_authenticated ON offer_categories;
CREATE POLICY offer_categories_select_authenticated
  ON offer_categories FOR SELECT TO authenticated
  USING (is_active = true);
