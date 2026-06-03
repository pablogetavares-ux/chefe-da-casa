-- BH como hub regional: raio 300 km (leste de MG) + escopo nacional no app.

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_offer_search_radius_km_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_offer_search_radius_km_check
  CHECK (offer_search_radius_km IN (10, 25, 50, 100, 300));

ALTER TABLE profiles
  ALTER COLUMN offer_search_radius_km SET DEFAULT 300;

-- Mercados no leste de Minas (até ~300 km de Belo Horizonte).
INSERT INTO regional_stores (name, chain, city, state, neighborhood, latitude, longitude, is_active)
SELECT v.name, v.chain, v.city, v.state, v.neighborhood, v.latitude, v.longitude, true
FROM (
  VALUES
    ('Supermercado GV Centro', 'Atacadão', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float),
    ('Mart Minas Teófilo', 'Mart Minas', 'Teófilo Otoni', 'MG', 'Centro', -17.8575::float, -41.5052::float),
    ('Supermercado Muriaé', 'Supernosso', 'Muriaé', 'MG', 'Centro', -21.1306::float, -42.3666::float),
    ('Rede Super Caratinga', 'Rede Super', 'Caratinga', 'MG', 'Centro', -19.7897::float, -42.1406::float),
    ('Cooperativa Manhuaçu', 'Coop', 'Manhuaçu', 'MG', 'Centro', -20.2584::float, -42.0336::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE NOT EXISTS (
  SELECT 1 FROM regional_stores rs
  WHERE rs.city = v.city AND rs.state = v.state AND rs.chain = v.chain
);

-- Ofertas demo no leste de MG (expansão a partir do hub BH).
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
      'Governador Valadares',
      'MG',
      'Atacadão',
      'Arroz tipo 1 5kg',
      'Arroz agulhinha promoção',
      'PANTRY',
      'Arroz branco',
      22.90,
      28.90,
      'pacote',
      14,
      '/offers/arroz.svg',
      ARRAY['arroz', 'arroz branco']
    ),
    (
      'Teófilo Otoni',
      'MG',
      'Mart Minas',
      'Frango inteiro resfriado',
      'Peito e coxa para o dia a dia',
      'MEAT',
      'Frango inteiro',
      12.99,
      16.90,
      'kg',
      7,
      '/offers/frango.svg',
      ARRAY['frango', 'frango inteiro']
    ),
    (
      'Muriaé',
      'MG',
      'Supernosso',
      'Tomate italiano',
      'Tomate maduro para molho',
      'PRODUCE',
      'Tomate italiano',
      5.49,
      7.99,
      'kg',
      5,
      '/offers/tomate.svg',
      ARRAY['tomate', 'tomate italiano']
    ),
    (
      'Caratinga',
      'MG',
      'Rede Super',
      'Folhas verdes mix',
      'Alface e rúcula hidropônicas',
      'PRODUCE',
      'Folhas verdes',
      6.90,
      9.50,
      'maço',
      4,
      '/offers/folhas.svg',
      ARRAY['alface', 'rucula', 'folhas']
    ),
    (
      'Manhuaçu',
      'MG',
      'Coop',
      'Iogurte natural 900g',
      'Iogurte sem açúcar',
      'DAIRY',
      'Iogurte natural',
      8.90,
      11.50,
      'un',
      10,
      '/offers/iogurte.svg',
      ARRAY['iogurte', 'iogurte natural']
    )
) AS v(city, state, chain, title, description, category, product_name, current_price, previous_price, unit, valid_days, image_url, ingredient_keywords)
WHERE s.city = v.city
  AND s.state = v.state
  AND s.chain = v.chain
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro
    WHERE ro.store_id = s.id AND ro.product_name = v.product_name
  );

INSERT INTO offer_market_catalog (
  external_partner_id,
  name,
  chain,
  city,
  state,
  latitude,
  longitude,
  is_active,
  metadata
)
SELECT
  v.external_partner_id,
  v.name,
  v.chain,
  v.city,
  v.state,
  v.latitude,
  v.longitude,
  true,
  jsonb_build_object('hub', 'Belo Horizonte', 'coverage', 'national')
FROM (
  VALUES
    ('national-sp-paulista', 'Extra Paulista Nacional', 'Extra', 'São Paulo', 'SP', -23.5505::float, -46.6333::float),
    ('national-rj-tijuca', 'Assaí Tijuca Nacional', 'Assaí', 'Rio de Janeiro', 'RJ', -22.9068::float, -43.1729::float),
    ('national-bh-savassi', 'Carrefour Savassi Nacional', 'Carrefour', 'Belo Horizonte', 'MG', -19.9167::float, -43.9345::float),
    ('national-gv-centro', 'Atacadão GV Nacional', 'Atacadão', 'Governador Valadares', 'MG', -18.8512::float, -41.9495::float)
) AS v(external_partner_id, name, chain, city, state, latitude, longitude)
WHERE NOT EXISTS (
  SELECT 1 FROM offer_market_catalog c
  WHERE c.external_partner_id = v.external_partner_id
);
