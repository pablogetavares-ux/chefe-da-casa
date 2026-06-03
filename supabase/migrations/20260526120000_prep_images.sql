-- Imagens de preparo por passo (reels estáticos)

ALTER TABLE public.recipe_prep_videos
  ADD COLUMN IF NOT EXISTS step_images jsonb,
  ADD COLUMN IF NOT EXISTS media_provider text NOT NULL DEFAULT 'stock-image';

COMMENT ON COLUMN public.recipe_prep_videos.step_images IS
  'Array JSON: [{ step, imageUrl?, storagePath?, source }]';

CREATE INDEX IF NOT EXISTS recipe_prep_videos_media_provider_idx
  ON public.recipe_prep_videos (media_provider);

-- Bucket privado para imagens IA de preparo (PNG/WebP, 4MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prep-images',
  'prep-images',
  false,
  4194304,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY prep_images_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'prep-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY prep_images_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'prep-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY prep_images_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'prep-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'prep-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY prep_images_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'prep-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
