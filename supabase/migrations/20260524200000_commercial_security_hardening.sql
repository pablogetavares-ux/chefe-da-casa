-- Hardening comercial: RLS performance + tabelas audit-only

DROP POLICY IF EXISTS ingredient_scans_select ON public.ingredient_scans;
DROP POLICY IF EXISTS ingredient_scans_insert ON public.ingredient_scans;
DROP POLICY IF EXISTS ingredient_scans_delete ON public.ingredient_scans;

CREATE POLICY ingredient_scans_select ON public.ingredient_scans
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY ingredient_scans_insert ON public.ingredient_scans
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY ingredient_scans_delete ON public.ingredient_scans
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS food_scans_insert ON storage.objects;
DROP POLICY IF EXISTS food_scans_select ON storage.objects;
DROP POLICY IF EXISTS food_scans_delete ON storage.objects;
DROP POLICY IF EXISTS food_scans_update ON storage.objects;

CREATE POLICY food_scans_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY food_scans_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY food_scans_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY food_scans_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'food-scans'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS account_privacy_events_deny ON public.account_privacy_events;
CREATE POLICY account_privacy_events_deny ON public.account_privacy_events
  FOR ALL TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS plan_change_logs_deny ON public.plan_change_logs;
CREATE POLICY plan_change_logs_deny ON public.plan_change_logs
  FOR ALL TO authenticated, anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS stripe_webhook_events_deny ON public.stripe_webhook_events;
CREATE POLICY stripe_webhook_events_deny ON public.stripe_webhook_events
  FOR ALL TO authenticated, anon
  USING (false)
  WITH CHECK (false);
