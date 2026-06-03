-- Dev fallback: INSERT via server client autenticado quando service_role ausente.
-- Produção: SUPABASE_SERVICE_ROLE_KEY + reaplicar security_audit_tables.

DROP POLICY IF EXISTS ai_generations_insert_own ON public.ai_generations;
CREATE POLICY ai_generations_insert_own ON public.ai_generations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS ai_generations_update_own ON public.ai_generations;
CREATE POLICY ai_generations_update_own ON public.ai_generations
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS ingredient_scans_insert ON public.ingredient_scans;
CREATE POLICY ingredient_scans_insert ON public.ingredient_scans
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS usage_logs_insert_own ON public.usage_logs;
CREATE POLICY usage_logs_insert_own ON public.usage_logs
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
