-- Revoke public RPC access on security-sensitive functions

REVOKE EXECUTE ON FUNCTION public.log_plan_change(uuid, "PlanTier", "PlanTier", text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_plan_change(uuid, "PlanTier", "PlanTier", text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_plan_change(uuid, "PlanTier", "PlanTier", text, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.log_plan_change(uuid, "PlanTier", "PlanTier", text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_plan_self_update() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_plan_self_update() FROM anon;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_plan_self_update() FROM authenticated;
