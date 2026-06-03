-- Ingredient scans from vision AI + Supabase Storage bucket

CREATE TABLE IF NOT EXISTS public.ingredient_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  detected_ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  scene_description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingredient_scans_user_id_idx
  ON public.ingredient_scans (user_id, created_at DESC);

ALTER TABLE public.ingredient_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY ingredient_scans_select ON public.ingredient_scans
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY ingredient_scans_insert ON public.ingredient_scans
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ingredient_scans_delete ON public.ingredient_scans
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Storage bucket for food scan images (private, 5MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'food-scans',
  'food-scans',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY food_scans_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY food_scans_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY food_scans_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY food_scans_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
