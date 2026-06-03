-- Production SaaS hardening: webhook idempotency, plan audit, indexes, security

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.plan_change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  previous_plan "PlanTier",
  new_plan "PlanTier" NOT NULL,
  source text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_change_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS plan_change_logs_user_id_idx ON public.plan_change_logs(user_id);
CREATE INDEX IF NOT EXISTS plan_change_logs_created_at_idx ON public.plan_change_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS usage_logs_user_action_created_idx
  ON public.usage_logs(user_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_generations_user_status_created_idx
  ON public.ai_generations(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS profiles_plan_idx ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

CREATE OR REPLACE FUNCTION public.prevent_profile_plan_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'plan_change_not_allowed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_plan_self_update ON public.profiles;
CREATE TRIGGER profiles_prevent_plan_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_plan_self_update();

REVOKE EXECUTE ON FUNCTION public.mock_upgrade_plan("PlanTier") FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.mock_upgrade_plan("PlanTier") FROM anon;
GRANT EXECUTE ON FUNCTION public.mock_upgrade_plan("PlanTier") TO service_role;

CREATE OR REPLACE FUNCTION public.log_plan_change(
  p_user_id uuid,
  p_previous "PlanTier",
  p_new "PlanTier",
  p_source text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.plan_change_logs (user_id, previous_plan, new_plan, source, metadata)
  VALUES (p_user_id, p_previous, p_new, p_source, p_metadata);
END;
$$;

REVOKE ALL ON FUNCTION public.log_plan_change(uuid, "PlanTier", "PlanTier", text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_plan_change(uuid, "PlanTier", "PlanTier", text, jsonb) TO service_role;
