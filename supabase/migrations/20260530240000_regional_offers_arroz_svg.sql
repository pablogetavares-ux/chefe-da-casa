-- Arroz: foto no Storage exibia prato preparado; usar ícone consistente em todas as cidades.
UPDATE regional_offers
SET image_url = '/offers/arroz.svg'
WHERE product_name ILIKE '%arroz%'
   OR title ILIKE '%arroz%';
