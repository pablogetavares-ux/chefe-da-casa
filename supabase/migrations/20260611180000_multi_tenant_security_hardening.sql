-- Multi-tenant security: limita escrita client-side em logs/IA, agrega contagem do hub.

-- ─── Usage logs: sem INSERT direto (evita inflar limites de plano) ───────────
DROP POLICY IF EXISTS usage_logs_insert_own ON public.usage_logs;

CREATE OR REPLACE FUNCTION public.record_usage_log(
  p_action text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  IF p_action IS NULL OR length(trim(p_action)) = 0 OR length(p_action) > 100 THEN
    RAISE EXCEPTION 'invalid_action';
  END IF;
  INSERT INTO public.usage_logs (user_id, action, metadata)
  VALUES (auth.uid(), p_action, p_metadata);
END;
$$;

REVOKE ALL ON FUNCTION public.record_usage_log(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_usage_log(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_usage_log(text, jsonb) TO service_role;

-- ─── AI generations: histórico/prompts só via API (service role) ─────────────
DROP POLICY IF EXISTS ai_generations_insert_own ON public.ai_generations;
DROP POLICY IF EXISTS ai_generations_update_own ON public.ai_generations;

-- ─── Hub: índice + RPC agregada (performance) ───────────────────────────────
CREATE INDEX IF NOT EXISTS regional_offers_active_valid_until_store_idx
  ON public.regional_offers (store_id, valid_until DESC)
  WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.count_active_offers_by_vertical()
RETURNS TABLE (vertical_slug text, offer_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    v.slug AS vertical_slug,
    count(ro.id)::bigint AS offer_count
  FROM public.offer_verticals v
  LEFT JOIN public.regional_stores rs
    ON rs.vertical_id = v.id AND rs.is_active = true
  LEFT JOIN public.regional_offers ro
    ON ro.store_id = rs.id
   AND ro.is_active = true
   AND ro.valid_until > now()
  GROUP BY v.slug;
$$;

REVOKE ALL ON FUNCTION public.count_active_offers_by_vertical() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_active_offers_by_vertical() TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_active_offers_by_vertical() TO service_role;

COMMENT ON FUNCTION public.count_active_offers_by_vertical IS
  'Contagem agregada de ofertas ativas por vertical (multi-tenant safe read).';

-- ─── Cashback: sem INSERT client (ledger só backend) ────────────────────────
-- RLS já permite apenas SELECT own; INSERT negado por omissão.
