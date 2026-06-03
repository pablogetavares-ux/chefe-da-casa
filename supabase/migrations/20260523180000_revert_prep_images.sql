-- Reverte migração de imagens de preparo (20260526120000_prep_images.sql)
-- Bucket prep-images vazio pode permanecer (remoção direta bloqueada pelo Storage).

DROP POLICY IF EXISTS prep_images_insert ON storage.objects;
DROP POLICY IF EXISTS prep_images_select ON storage.objects;
DROP POLICY IF EXISTS prep_images_update ON storage.objects;
DROP POLICY IF EXISTS prep_images_delete ON storage.objects;

DROP INDEX IF EXISTS public.recipe_prep_videos_media_provider_idx;

ALTER TABLE public.recipe_prep_videos
  DROP COLUMN IF EXISTS step_images,
  DROP COLUMN IF EXISTS media_provider;
