-- Core tables RLS (profiles, recipes, pantry_items) — versionadas no repo.
-- Idempotente: só cria policies ausentes.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY profiles_select_own ON public.profiles
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY profiles_update_own ON public.profiles
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = id)
      WITH CHECK ((SELECT auth.uid()) = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'recipes' AND policyname = 'recipes_select_own'
  ) THEN
    CREATE POLICY recipes_select_own ON public.recipes
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'recipes' AND policyname = 'recipes_insert_own'
  ) THEN
    CREATE POLICY recipes_insert_own ON public.recipes
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'recipes' AND policyname = 'recipes_update_own'
  ) THEN
    CREATE POLICY recipes_update_own ON public.recipes
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'recipes' AND policyname = 'recipes_delete_own'
  ) THEN
    CREATE POLICY recipes_delete_own ON public.recipes
      FOR DELETE TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pantry_items' AND policyname = 'pantry_select_own'
  ) THEN
    CREATE POLICY pantry_select_own ON public.pantry_items
      FOR SELECT TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pantry_items' AND policyname = 'pantry_insert_own'
  ) THEN
    CREATE POLICY pantry_insert_own ON public.pantry_items
      FOR INSERT TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pantry_items' AND policyname = 'pantry_update_own'
  ) THEN
    CREATE POLICY pantry_update_own ON public.pantry_items
      FOR UPDATE TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pantry_items' AND policyname = 'pantry_delete_own'
  ) THEN
    CREATE POLICY pantry_delete_own ON public.pantry_items
      FOR DELETE TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;
END $$;
