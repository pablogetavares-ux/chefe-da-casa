-- Preparação capas de receita (Gemini pós go-live). Aditivo — não altera fluxos existentes.

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS cover_image_url text;

COMMENT ON COLUMN public.recipes.cover_image_url IS
  'URL pública da imagem de capa (bucket recipe-images). Preenchida quando GEMINI_API_KEY estiver ativa.';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  public = EXCLUDED.public;

DROP POLICY IF EXISTS recipe_images_insert ON storage.objects;
DROP POLICY IF EXISTS recipe_images_update ON storage.objects;
DROP POLICY IF EXISTS recipe_images_delete ON storage.objects;

CREATE POLICY recipe_images_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY recipe_images_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY recipe_images_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
