-- Expand BH catalog: ovo, tomate, azeite (mirrors MCP migration regional_offers_bh_expansion)
INSERT INTO regional_offers (
  store_id,
  title,
  description,
  category,
  product_name,
  current_price,
  previous_price,
  unit,
  valid_until,
  image_url,
  ingredient_keywords
)
SELECT
  s.id,
  v.title,
  v.description,
  v.category::"OfferCategory",
  v.product_name,
  v.current_price,
  v.previous_price,
  v.unit,
  now() + v.valid_days * interval '1 day',
  v.image_url,
  v.ingredient_keywords
FROM regional_stores s
CROSS JOIN (
  VALUES
    (
      'Tomate salada',
      'Tomate vermelho fresquinho',
      'PRODUCE',
      'Tomate salada',
      4.49,
      6.99,
      'kg',
      7,
      '/offers/tomate.svg',
      ARRAY['tomate', 'tomate salada', 'tomate vermelho']
    ),
    (
      'Ovos brancos cartela 30un',
      'Ovos frescos caipira',
      'DAIRY',
      'Ovos brancos',
      18.90,
      23.50,
      'cartela',
      10,
      '/offers/ovos.svg',
      ARRAY['ovo', 'ovos', 'ovo caipira']
    ),
    (
      'Azeite extra virgem 500ml',
      'Ideal para refogados leves',
      'PANTRY',
      'Azeite extra virgem',
      24.90,
      32.90,
      'garrafa',
      14,
      '/offers/azeite.svg',
      ARRAY['azeite', 'azeite de oliva', 'oleo']
    )
) AS v(title, description, category, product_name, current_price, previous_price, unit, valid_days, image_url, ingredient_keywords)
WHERE s.city = 'Belo Horizonte'
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro
    WHERE ro.store_id = s.id AND ro.product_name = v.product_name
  );
