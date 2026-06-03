-- Fix broken Unsplash URLs → local /public/offers SVG assets
UPDATE regional_offers SET image_url = CASE
  WHEN product_name ILIKE '%tomate%' OR title ILIKE '%tomate%' THEN '/offers/tomate.svg'
  WHEN product_name ILIKE '%ovo%' OR title ILIKE '%ovo%' THEN '/offers/ovos.svg'
  WHEN product_name ILIKE '%azeite%' OR title ILIKE '%azeite%' THEN '/offers/azeite.svg'
  WHEN product_name ILIKE '%iogurte%' OR title ILIKE '%iogurte%' THEN '/offers/iogurte.svg'
  WHEN product_name ILIKE '%frango%' OR title ILIKE '%frango%' OR product_name ILIKE '%filé%' THEN '/offers/frango.svg'
  WHEN product_name ILIKE '%arroz%' OR title ILIKE '%arroz%' THEN '/offers/arroz.svg'
  WHEN product_name ILIKE '%salm%' OR title ILIKE '%salm%' THEN '/offers/salmao.svg'
  WHEN product_name ILIKE '%folha%' OR title ILIKE '%folha%' OR title ILIKE '%mix%' THEN '/offers/folhas.svg'
  ELSE '/offers/folhas.svg'
END
WHERE image_url IS NULL OR image_url LIKE 'https://images.unsplash.com/%';
