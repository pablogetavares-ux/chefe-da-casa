-- Restrict record_usage_log to service role only (no direct client RPC).

REVOKE ALL ON FUNCTION public.record_usage_log(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_usage_log(text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.record_usage_log(text, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_usage_log(text, jsonb) TO service_role;
