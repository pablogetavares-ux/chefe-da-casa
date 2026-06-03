-- RLS performance: recipe_prep_videos

DROP POLICY IF EXISTS recipe_prep_videos_select ON public.recipe_prep_videos;
DROP POLICY IF EXISTS recipe_prep_videos_insert ON public.recipe_prep_videos;
DROP POLICY IF EXISTS recipe_prep_videos_delete ON public.recipe_prep_videos;

CREATE POLICY recipe_prep_videos_select ON public.recipe_prep_videos
  FOR SELECT TO authenticated
  USING (is_system = true OR user_id = (SELECT auth.uid()));

CREATE POLICY recipe_prep_videos_insert ON public.recipe_prep_videos
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND is_system = false);

CREATE POLICY recipe_prep_videos_delete ON public.recipe_prep_videos
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) AND is_system = false);
