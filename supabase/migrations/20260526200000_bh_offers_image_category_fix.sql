-- Corrige categorias e força remapeamento de fotos BH (ovos ≠ laticínios)
UPDATE regional_offers
SET
  category = 'PANTRY'::"OfferCategory",
  updated_at = now()
WHERE product_name ILIKE '%ovo%'
   OR title ILIKE '%ovo%';

UPDATE regional_offers
SET
  category = 'DAIRY'::"OfferCategory",
  updated_at = now()
WHERE product_name ILIKE '%iogurte%'
   OR title ILIKE '%iogurte%';
