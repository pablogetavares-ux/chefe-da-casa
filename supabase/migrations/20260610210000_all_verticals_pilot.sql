-- Piloto: todas as verticais do hub com lojas e ofertas (BH, SP, GV).
-- Idempotente — complementa pharmacy (20260610200000).

-- ─── Ativar verticais e categorias ─────────────────────────────────────────

UPDATE offer_verticals
SET is_active = true, updated_at = now()
WHERE slug IN (
  'pet_shop', 'clothing', 'footwear', 'construction', 'electronics'
);

UPDATE offer_categories oc
SET is_active = true, updated_at = now()
FROM offer_verticals ov
WHERE oc.vertical_id = ov.id
  AND ov.slug IN (
    'pet_shop', 'clothing', 'footwear', 'construction', 'electronics'
  )
  AND oc.slug = 'general';

-- ─── Pet Shop ───────────────────────────────────────────────────────────────

INSERT INTO regional_stores (
  name, chain, city, state, neighborhood, latitude, longitude, is_active, vertical_id
)
SELECT v.name, v.chain, v.city, v.state, v.neighborhood, v.latitude, v.longitude, true, ov.id
FROM offer_verticals ov
CROSS JOIN (
  VALUES
    ('Petz Savassi', 'Petz', 'Belo Horizonte', 'MG', 'Savassi', -19.9185::float, -43.9378::float),
    ('Cobasi Morumbi', 'Cobasi', 'São Paulo', 'SP', 'Morumbi', -23.6172::float, -46.7013::float),
    ('Pet Center GV', 'Pet Center', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE ov.slug = 'pet_shop'
  AND NOT EXISTS (
    SELECT 1 FROM regional_stores rs
    WHERE rs.chain = v.chain AND rs.city = v.city AND rs.vertical_id = ov.id
  );

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT rs.id, o.title, o.description, 'OTHER'::"OfferCategory", oc.id, o.product_name,
  o.current_price, o.previous_price, o.unit, now() + o.valid_days * interval '1 day', o.ingredient_keywords
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'pet_shop'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'general'
CROSS JOIN (
  VALUES
    ('Petz', 'Belo Horizonte', 'MG', 'Ração Premier Golden 15kg', 'Cães adultos — saco grande', 'Ração Golden 15kg', 119.90, 149.90, 'saco', 14, ARRAY['ração', 'cachorro', 'pet']),
    ('Cobasi', 'São Paulo', 'SP', 'Antipulgas Bravecto 10–20kg', 'Proteção 12 semanas', 'Bravecto 10-20kg', 189.90, 229.90, 'un', 21, ARRAY['antipulgas', 'cão', 'pet']),
    ('Pet Center', 'Governador Valadares', 'MG', 'Areia sanitária 4kg', 'Aglomerante — gatos', 'Areia sanitária 4kg', 19.90, 27.90, 'pacote', 10, ARRAY['areia', 'gato', 'pet'])
) AS o(chain, city, state, title, description, product_name, current_price, previous_price, unit, valid_days, ingredient_keywords)
WHERE rs.chain = o.chain AND rs.city = o.city AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );

-- ─── Roupas ─────────────────────────────────────────────────────────────────

INSERT INTO regional_stores (
  name, chain, city, state, neighborhood, latitude, longitude, is_active, vertical_id
)
SELECT v.name, v.chain, v.city, v.state, v.neighborhood, v.latitude, v.longitude, true, ov.id
FROM offer_verticals ov
CROSS JOIN (
  VALUES
    ('Renner BH Centro', 'Renner', 'Belo Horizonte', 'MG', 'Centro', -19.9243::float, -43.9412::float),
    ('C&A Paulista', 'C&A', 'São Paulo', 'SP', 'Bela Vista', -23.5615::float, -46.6559::float),
    ('Marisa GV Centro', 'Marisa', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE ov.slug = 'clothing'
  AND NOT EXISTS (
    SELECT 1 FROM regional_stores rs
    WHERE rs.chain = v.chain AND rs.city = v.city AND rs.vertical_id = ov.id
  );

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT rs.id, o.title, o.description, 'OTHER'::"OfferCategory", oc.id, o.product_name,
  o.current_price, o.previous_price, o.unit, now() + o.valid_days * interval '1 day', o.ingredient_keywords
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'clothing'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'general'
CROSS JOIN (
  VALUES
    ('Renner', 'Belo Horizonte', 'MG', 'Kit 3 camisetas básicas algodão', 'Masculino — cores sortidas', 'Camiseta básica kit 3', 49.90, 79.90, 'kit', 12, ARRAY['camiseta', 'básica', 'moda']),
    ('C&A', 'São Paulo', 'SP', 'Calça jeans feminina slim', 'Promoção da semana', 'Calça jeans feminina', 89.90, 129.90, 'un', 15, ARRAY['calça', 'jeans', 'moda']),
    ('Marisa', 'Governador Valadares', 'MG', 'Conjunto infantil verão', 'Menino e menina', 'Conjunto infantil verão', 59.90, 89.90, 'un', 10, ARRAY['infantil', 'conjunto', 'moda'])
) AS o(chain, city, state, title, description, product_name, current_price, previous_price, unit, valid_days, ingredient_keywords)
WHERE rs.chain = o.chain AND rs.city = o.city AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );

-- ─── Calçados ───────────────────────────────────────────────────────────────

INSERT INTO regional_stores (
  name, chain, city, state, neighborhood, latitude, longitude, is_active, vertical_id
)
SELECT v.name, v.chain, v.city, v.state, v.neighborhood, v.latitude, v.longitude, true, ov.id
FROM offer_verticals ov
CROSS JOIN (
  VALUES
    ('Centauro Savassi', 'Centauro', 'Belo Horizonte', 'MG', 'Savassi', -19.9185::float, -43.9378::float),
    ('Nike Paulista', 'Nike', 'São Paulo', 'SP', 'Bela Vista', -23.5615::float, -46.6559::float),
    ('Piccadilly GV', 'Piccadilly', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE ov.slug = 'footwear'
  AND NOT EXISTS (
    SELECT 1 FROM regional_stores rs
    WHERE rs.chain = v.chain AND rs.city = v.city AND rs.vertical_id = ov.id
  );

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT rs.id, o.title, o.description, 'OTHER'::"OfferCategory", oc.id, o.product_name,
  o.current_price, o.previous_price, o.unit, now() + o.valid_days * interval '1 day', o.ingredient_keywords
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'footwear'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'general'
CROSS JOIN (
  VALUES
    ('Centauro', 'Belo Horizonte', 'MG', 'Tênis corrida masculino', 'Amortecimento — treino', 'Tênis corrida masculino', 199.90, 279.90, 'par', 14, ARRAY['tênis', 'corrida', 'calçado']),
    ('Nike', 'São Paulo', 'SP', 'Chinelo slides Nike', 'Conforto dia a dia', 'Chinelo slides Nike', 79.90, 119.90, 'par', 12, ARRAY['chinelo', 'sandália', 'calçado']),
    ('Piccadilly', 'Governador Valadares', 'MG', 'Sandália conforto feminina', 'Palmilha macia', 'Sandália conforto feminina', 89.90, 129.90, 'par', 10, ARRAY['sandália', 'feminina', 'calçado'])
) AS o(chain, city, state, title, description, product_name, current_price, previous_price, unit, valid_days, ingredient_keywords)
WHERE rs.chain = o.chain AND rs.city = o.city AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );

-- ─── Materiais de Construção ────────────────────────────────────────────────

INSERT INTO regional_stores (
  name, chain, city, state, neighborhood, latitude, longitude, is_active, vertical_id
)
SELECT v.name, v.chain, v.city, v.state, v.neighborhood, v.latitude, v.longitude, true, ov.id
FROM offer_verticals ov
CROSS JOIN (
  VALUES
    ('Leroy Merlin BH', 'Leroy Merlin', 'Belo Horizonte', 'MG', 'Buritis', -19.9580::float, -43.9700::float),
    ('Telhanorte SP', 'Telhanorte', 'São Paulo', 'SP', 'Pinheiros', -23.5670::float, -46.6910::float),
    ('C&C Materiais GV', 'C&C', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE ov.slug = 'construction'
  AND NOT EXISTS (
    SELECT 1 FROM regional_stores rs
    WHERE rs.chain = v.chain AND rs.city = v.city AND rs.vertical_id = ov.id
  );

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT rs.id, o.title, o.description, 'OTHER'::"OfferCategory", oc.id, o.product_name,
  o.current_price, o.previous_price, o.unit, now() + o.valid_days * interval '1 day', o.ingredient_keywords
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'construction'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'general'
CROSS JOIN (
  VALUES
    ('Leroy Merlin', 'Belo Horizonte', 'MG', 'Tinta acrílica 18L branca', 'Parede interna e externa', 'Tinta acrílica 18L', 189.90, 249.90, 'lata', 21, ARRAY['tinta', 'reforma', 'construção']),
    ('Telhanorte', 'São Paulo', 'SP', 'Cimento CP II 50kg', 'Obra e pequenos reparos', 'Cimento CP II 50kg', 32.90, 39.90, 'saco', 14, ARRAY['cimento', 'obra', 'construção']),
    ('C&C', 'Governador Valadares', 'MG', 'Kit ferramentas 49 peças', 'Manutenção em casa', 'Kit ferramentas 49 peças', 149.90, 199.90, 'kit', 15, ARRAY['ferramenta', 'kit', 'construção'])
) AS o(chain, city, state, title, description, product_name, current_price, previous_price, unit, valid_days, ingredient_keywords)
WHERE rs.chain = o.chain AND rs.city = o.city AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );

-- ─── Eletrônicos ────────────────────────────────────────────────────────────

INSERT INTO regional_stores (
  name, chain, city, state, neighborhood, latitude, longitude, is_active, vertical_id
)
SELECT v.name, v.chain, v.city, v.state, v.neighborhood, v.latitude, v.longitude, true, ov.id
FROM offer_verticals ov
CROSS JOIN (
  VALUES
    ('Magazine Luiza BH', 'Magazine Luiza', 'Belo Horizonte', 'MG', 'Centro', -19.9243::float, -43.9412::float),
    ('Casas Bahia SP', 'Casas Bahia', 'São Paulo', 'SP', 'Tatuapé', -23.5400::float, -46.5760::float),
    ('Extra GV', 'Extra', 'Governador Valadares', 'MG', 'Centro', -18.8512::float, -41.9495::float)
) AS v(name, chain, city, state, neighborhood, latitude, longitude)
WHERE ov.slug = 'electronics'
  AND NOT EXISTS (
    SELECT 1 FROM regional_stores rs
    WHERE rs.chain = v.chain AND rs.city = v.city AND rs.vertical_id = ov.id
  );

INSERT INTO regional_offers (
  store_id, title, description, category, category_id, product_name,
  current_price, previous_price, unit, valid_until, ingredient_keywords
)
SELECT rs.id, o.title, o.description, 'OTHER'::"OfferCategory", oc.id, o.product_name,
  o.current_price, o.previous_price, o.unit, now() + o.valid_days * interval '1 day', o.ingredient_keywords
FROM regional_stores rs
JOIN offer_verticals ov ON ov.id = rs.vertical_id AND ov.slug = 'electronics'
JOIN offer_categories oc ON oc.vertical_id = ov.id AND oc.slug = 'general'
CROSS JOIN (
  VALUES
    ('Magazine Luiza', 'Belo Horizonte', 'MG', 'Fone Bluetooth JBL Tune', 'Som sem fio — dia a dia', 'Fone Bluetooth JBL', 149.90, 199.90, 'un', 12, ARRAY['fone', 'bluetooth', 'eletrônico']),
    ('Casas Bahia', 'São Paulo', 'SP', 'Micro-ondas 20L Brastemp', 'Praticidade na cozinha', 'Micro-ondas 20L', 399.90, 499.90, 'un', 18, ARRAY['micro-ondas', 'eletro', 'eletrônico']),
    ('Extra', 'Governador Valadares', 'MG', 'Smart TV 43" Full HD', 'Streaming e TV aberta', 'Smart TV 43 Full HD', 1599.90, 1899.90, 'un', 21, ARRAY['tv', 'smart tv', 'eletrônico'])
) AS o(chain, city, state, title, description, product_name, current_price, previous_price, unit, valid_days, ingredient_keywords)
WHERE rs.chain = o.chain AND rs.city = o.city AND rs.state = o.state
  AND NOT EXISTS (
    SELECT 1 FROM regional_offers ro WHERE ro.store_id = rs.id AND ro.product_name = o.product_name
  );
