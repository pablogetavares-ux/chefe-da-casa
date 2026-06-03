-- Otimiza RLS initplan: auth.uid() avaliado uma vez por query (Supabase advisor).

DROP POLICY IF EXISTS monthly_purchase_lists_select_own ON public.monthly_purchase_lists;
DROP POLICY IF EXISTS monthly_purchase_lists_insert_own ON public.monthly_purchase_lists;
DROP POLICY IF EXISTS monthly_purchase_lists_update_own ON public.monthly_purchase_lists;
DROP POLICY IF EXISTS monthly_purchase_lists_delete_own ON public.monthly_purchase_lists;

CREATE POLICY monthly_purchase_lists_select_own
  ON public.monthly_purchase_lists FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY monthly_purchase_lists_insert_own
  ON public.monthly_purchase_lists FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY monthly_purchase_lists_update_own
  ON public.monthly_purchase_lists FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY monthly_purchase_lists_delete_own
  ON public.monthly_purchase_lists FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS monthly_purchase_items_select_own ON public.monthly_purchase_items;
DROP POLICY IF EXISTS monthly_purchase_items_insert_own ON public.monthly_purchase_items;
DROP POLICY IF EXISTS monthly_purchase_items_update_own ON public.monthly_purchase_items;
DROP POLICY IF EXISTS monthly_purchase_items_delete_own ON public.monthly_purchase_items;

CREATE POLICY monthly_purchase_items_select_own
  ON public.monthly_purchase_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY monthly_purchase_items_insert_own
  ON public.monthly_purchase_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY monthly_purchase_items_update_own
  ON public.monthly_purchase_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY monthly_purchase_items_delete_own
  ON public.monthly_purchase_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS weekly_meal_plans_select_own ON public.weekly_meal_plans;
DROP POLICY IF EXISTS weekly_meal_plans_insert_own ON public.weekly_meal_plans;
DROP POLICY IF EXISTS weekly_meal_plans_delete_own ON public.weekly_meal_plans;

CREATE POLICY weekly_meal_plans_select_own
  ON public.weekly_meal_plans FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY weekly_meal_plans_insert_own
  ON public.weekly_meal_plans FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY weekly_meal_plans_delete_own
  ON public.weekly_meal_plans FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
