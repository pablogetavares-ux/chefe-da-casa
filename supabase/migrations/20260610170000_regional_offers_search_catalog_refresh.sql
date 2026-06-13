-- Renova validade + leite em Manhuaçu para busca por produto.

UPDATE regional_offers
SET valid_until = now() + interval '30 days',
    updated_at = now()
WHERE is_active = true;

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT
  rs.id,
  'Leite integral 1L',
  'Leite UHT integral — promoção da semana',
  'DAIRY'::"OfferCategory",
  oc.id,
  'Leite integral 1L',
  4.89,
  5.99,
  'un',
  now() + interval '30 days',
  ARRAY['leite', 'leite integral', 'laticinio']
FROM regional_stores rs
JOIN offer_verticals v ON v.slug = 'supermarket'
JOIN offer_categories oc ON oc.vertical_id = v.id AND oc.slug = 'dairy'
WHERE rs.city = 'Manhuaçu' AND rs.chain = 'Coop'
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro
    WHERE ro.store_id = rs.id AND ro.product_name ILIKE '%leite%'
  );
