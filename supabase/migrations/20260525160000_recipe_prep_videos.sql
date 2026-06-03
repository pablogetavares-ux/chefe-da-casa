-- Vídeos curtos de preparo (vertical, estilo reels)
CREATE TABLE IF NOT EXISTS public.recipe_prep_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE CASCADE,
  title text NOT NULL,
  caption text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_seconds integer NOT NULL DEFAULT 30
    CHECK (duration_seconds > 0 AND duration_seconds <= 180),
  step_number integer CHECK (step_number IS NULL OR step_number > 0),
  is_system boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recipe_prep_videos_recipe_id_idx
  ON public.recipe_prep_videos (recipe_id);

CREATE INDEX IF NOT EXISTS recipe_prep_videos_user_id_idx
  ON public.recipe_prep_videos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS recipe_prep_videos_system_idx
  ON public.recipe_prep_videos (is_system, sort_order)
  WHERE is_system = true;

ALTER TABLE public.recipe_prep_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY recipe_prep_videos_select ON public.recipe_prep_videos
  FOR SELECT TO authenticated
  USING (is_system = true OR user_id = auth.uid());

CREATE POLICY recipe_prep_videos_insert ON public.recipe_prep_videos
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY recipe_prep_videos_delete ON public.recipe_prep_videos
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);
