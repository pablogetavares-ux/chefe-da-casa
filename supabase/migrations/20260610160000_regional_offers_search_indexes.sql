-- Busca inteligente: índices trigram + compostos para filtros regionais.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE INDEX IF NOT EXISTS regional_offers_product_name_trgm_idx
  ON regional_offers USING gin (product_name extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS regional_offers_title_trgm_idx
  ON regional_offers USING gin (title extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS regional_offers_active_valid_store_idx
  ON regional_offers (store_id, valid_until DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS regional_stores_state_city_active_idx
  ON regional_stores (state, city)
  WHERE is_active = true;
