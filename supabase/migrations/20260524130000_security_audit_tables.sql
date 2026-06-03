-- Audit tables: writes only via service_role (see src/lib/supabase/service-records.ts).
-- Authenticated clients retain SELECT on own rows for dashboard/history.

DROP POLICY IF EXISTS ai_generations_insert_own ON public.ai_generations;
DROP POLICY IF EXISTS ai_generations_update_own ON public.ai_generations;
DROP POLICY IF EXISTS ingredient_scans_insert ON public.ingredient_scans;
DROP POLICY IF EXISTS usage_logs_insert_own ON public.usage_logs;
