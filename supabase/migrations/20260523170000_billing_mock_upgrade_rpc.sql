-- Dev helper: simula upgrade de plano sem Stripe (app usa quando BILLING_DEV_MOCK=true)

CREATE OR REPLACE FUNCTION public.mock_upgrade_plan(p_plan "PlanTier")
RETURNS "PlanTier"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_plan NOT IN ('PRO', 'FAMILY', 'FREE') THEN
    RAISE EXCEPTION 'invalid plan';
  END IF;

  UPDATE public.profiles
  SET plan = p_plan, updated_at = now()
  WHERE id = uid;

  RETURN p_plan;
END;
$$;

REVOKE ALL ON FUNCTION public.mock_upgrade_plan("PlanTier") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mock_upgrade_plan("PlanTier") TO authenticated;
