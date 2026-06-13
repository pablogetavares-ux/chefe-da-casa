-- Ofertas de ingredientes comuns para hero de receitas (Caratinga + região).

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords, image_url
)
SELECT
  rs.id,
  o.title,
  o.description,
  COALESCE(oc.legacy_enum, 'OTHER'::"OfferCategory"),
  oc.id,
  o.product_name,
  o.current_price,
  o.previous_price,
  o.unit,
  now() + o.valid_days * interval '1 day',
  o.ingredient_keywords,
  o.image_url
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'supermarket'
CROSS JOIN (
  VALUES
    (
      'Rede Super', 'Caratinga', 'MG', 'meat',
      'Peito de frango kg', 'Corte limpo — promoção da semana', 'Peito de frango',
      18.90, 24.90, 'kg', 14,
      ARRAY['frango', 'peito de frango', 'carne', 'proteína'],
      '/offers/frango.svg'
    ),
    (
      'Rede Super', 'Caratinga', 'MG', 'produce',
      'Batata palha 200g', 'Crocante — acompanhamento rápido', 'Batata palha',
      7.49, 9.90, 'pacote', 10,
      ARRAY['batata', 'batata palha', 'acompanhamento'],
      NULL::text
    ),
    (
      'Rede Super', 'Caratinga', 'MG', 'pantry',
      'Arroz branco 5kg', 'Tipo 1 — saco família', 'Arroz branco 5kg',
      22.90, 27.90, 'saco', 21,
      ARRAY['arroz', 'grão', 'mercearia'],
      NULL::text
    )
) AS o(
  chain, city, state, category_slug, title, description, product_name,
  current_price, previous_price, unit, valid_days, ingredient_keywords, image_url
)
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = o.category_slug
WHERE rs.chain = o.chain AND rs.city = o.city AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro
    WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT
  rs.id,
  'Batata inglesa kg',
  'Versátil para fritas, assados e purê',
  COALESCE(oc.legacy_enum, 'PRODUCE'::"OfferCategory"),
  oc.id,
  'Batata inglesa',
  4.49, 5.99, 'kg', now() + interval '12 days',
  ARRAY['batata', 'batata inglesa', 'hortifruti']
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'supermarket'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'produce'
WHERE rs.city = 'Belo Horizonte' AND rs.state = 'MG' AND rs.is_active
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro
    WHERE ro.store_id = rs.id AND ro.product_name = 'Batata inglesa'
  )
LIMIT 1;
