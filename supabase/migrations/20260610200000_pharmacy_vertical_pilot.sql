-- Piloto: Farmácias com lojas e ofertas reais (BH, SP, GV).
-- Permite ao usuário ver farmácia + produto em promoção em /app/offers/pharmacy

UPDATE offer_verticals
SET is_active = true, updated_at = now()
WHERE slug = 'pharmacy';

UPDATE offer_categories
SET is_active = true, updated_at = now()
WHERE vertical_id = (SELECT id FROM offer_verticals WHERE slug = 'pharmacy');

INSERT INTO regional_stores (
  name, chain, city, state, neighborhood, latitude, longitude, is_active, vertical_id
)
SELECT
  v.name,
  v.chain,
  v.city,
  v.state,
  v.neighborhood,
  v.latitude,
  v.longitude,
  true,
  ov.id
FROM offer_verticals ov
CROSS JOIN (
  VALUES
    ('Drogasil Savassi', 'Drogasil', 'Belo Horizonte', 'MG', 'Savassi', -19.9185::float, -43.9378::float),
    ('Pacheco Afonso Pena', 'Pacheco', 'Belo Horizonte', 'MG', 'Centro', -19.9243::float, -43.9412::float),
    ('Droga Raia Paulista', 'Raia', 'São Paulo', 'SP', 'Bela Vista', -23.5615::float, -46.6559::float),
    ('Panvel GV Centro', 'Panvel', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE ov.slug = 'pharmacy'
  AND NOT EXISTS (
    SELECT 1 FROM regional_stores rs
    WHERE rs.chain = v.chain
      AND rs.city = v.city
      AND rs.vertical_id = ov.id
  );

INSERT INTO regional_offers (
  store_id,
  title,
  description,
  category,
  category_id,
  product_name,
  current_price,
  previous_price,
  unit,
  valid_until,
  ingredient_keywords
)
SELECT
  rs.id,
  o.title,
  o.description,
  'OTHER'::"OfferCategory",
  oc.id,
  o.product_name,
  o.current_price,
  o.previous_price,
  o.unit,
  now() + o.valid_days * interval '1 day',
  o.ingredient_keywords
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'pharmacy'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'general'
CROSS JOIN (
  VALUES
    (
      'Drogasil', 'Belo Horizonte', 'MG',
      'Vitamina C 1000mg 30 comprimidos',
      'Suplemento imunidade — promoção da semana',
      'Vitamina C 1000mg',
      24.90, 34.90, 'caixa', 14,
      ARRAY['vitamina c', 'vitamina', 'suplemento']
    ),
    (
      'Drogasil', 'Belo Horizonte', 'MG',
      'Dipirona 500mg 20 comprimidos',
      'Analgésico e antitérmico',
      'Dipirona 500mg',
      8.49, 12.90, 'caixa', 10,
      ARRAY['dipirona', 'analgésico', 'remédio']
    ),
    (
      'Pacheco', 'Belo Horizonte', 'MG',
      'Protetor solar FPS 50 200ml',
      'Proteção UVA/UVB — verão',
      'Protetor solar FPS 50',
      39.90, 59.90, 'un', 21,
      ARRAY['protetor solar', 'fps', 'dermocosmético']
    ),
    (
      'Raia', 'São Paulo', 'SP',
      'Omeprazol 20mg 28 cápsulas',
      'Genérico — estômago',
      'Omeprazol 20mg',
      18.90, 27.50, 'caixa', 12,
      ARRAY['omeprazol', 'genérico', 'remédio']
    ),
    (
      'Panvel', 'Governador Valadares', 'MG',
      'Fralda infantil M 36 unidades',
      'Linha premium — bebê',
      'Fralda infantil M',
      49.90, 64.90, 'pacote', 15,
      ARRAY['fralda', 'infantil', 'bebê']
    )
) AS o(chain, city, state, title, description, product_name, current_price, previous_price, unit, valid_days, ingredient_keywords)
WHERE rs.chain = o.chain
  AND rs.city = o.city
  AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro
    WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );
