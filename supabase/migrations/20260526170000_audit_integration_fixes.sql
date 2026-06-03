-- Audit fixes: performance index, storage security, copy sync

CREATE INDEX IF NOT EXISTS offer_favorites_offer_id_idx
  ON offer_favorites(offer_id);

-- Public bucket URLs work without a broad SELECT policy; removing it blocks object listing via API.
DROP POLICY IF EXISTS offer_images_public_read ON storage.objects;

UPDATE regional_offers
SET
  description = 'Bandeja 500g — ideal para molhos e receitas',
  updated_at = now()
WHERE product_name = 'Tomate italiano'
  AND description ILIKE '%saladas%';
