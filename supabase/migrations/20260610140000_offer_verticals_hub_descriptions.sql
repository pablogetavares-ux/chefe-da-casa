-- Hub de Ofertas: descrições nas verticais + leitura do catálogo completo.

ALTER TABLE offer_verticals
  ADD COLUMN IF NOT EXISTS description text;

UPDATE offer_verticals SET
  name = 'Supermercados',
  description = 'Promoções de alimentos, bebidas e itens do dia a dia nos mercados da sua região.',
  icon_key = 'shopping-cart',
  sort_order = 1,
  is_active = true
WHERE slug = 'supermarket';

UPDATE offer_verticals SET
  name = 'Farmácias',
  description = 'Descontos em medicamentos, vitaminas e produtos de saúde e bem-estar.',
  icon_key = 'pill',
  sort_order = 2,
  is_active = false
WHERE slug = 'pharmacy';

UPDATE offer_verticals SET
  name = 'Pet Shop',
  description = 'Ofertas em ração, acessórios e cuidados para cães, gatos e outros pets.',
  icon_key = 'paw-print',
  sort_order = 3,
  is_active = false
WHERE slug = 'pet_shop';

UPDATE offer_verticals SET
  name = 'Roupas',
  description = 'Moda feminina, masculina e infantil com preços especiais perto de você.',
  icon_key = 'shirt',
  sort_order = 4,
  is_active = false
WHERE slug = 'clothing';

UPDATE offer_verticals SET
  name = 'Calçados',
  description = 'Tênis, sandálias e calçados para todas as ocasiões em promoção.',
  icon_key = 'footprints',
  sort_order = 5,
  is_active = false
WHERE slug = 'footwear';

UPDATE offer_verticals SET
  name = 'Materiais de Construção',
  description = 'Tintas, ferragens e materiais para reforma e obra com os melhores preços.',
  icon_key = 'hammer',
  sort_order = 6,
  is_active = false
WHERE slug = 'construction';

UPDATE offer_verticals SET
  name = 'Eletrônicos',
  description = 'Celulares, informática e eletrodomésticos em oferta na sua cidade.',
  icon_key = 'smartphone',
  sort_order = 7,
  is_active = false
WHERE slug = 'electronics';

UPDATE offer_verticals SET is_active = false, sort_order = 99
WHERE slug = 'services';

DROP POLICY IF EXISTS offer_verticals_select_authenticated ON offer_verticals;
CREATE POLICY offer_verticals_select_authenticated
  ON offer_verticals FOR SELECT TO authenticated
  USING (true);
