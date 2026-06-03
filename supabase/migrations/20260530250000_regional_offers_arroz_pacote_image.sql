-- Substitui arroz.jpg (foto de arroz frito) por arroz-pacote.jpg após sync local.
-- Rode: npm run offers:sync-images

UPDATE regional_offers
SET image_url = REPLACE(image_url, 'arroz.jpg', 'arroz-pacote.jpg')
WHERE image_url LIKE '%/offer-images/arroz.jpg%';
