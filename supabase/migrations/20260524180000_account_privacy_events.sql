-- LGPD: auditoria de exportação de dados e exclusão de conta

CREATE TABLE IF NOT EXISTS public.account_privacy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('data_export', 'account_deletion')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.account_privacy_events IS
  'Trilha de auditoria LGPD — apenas service role.';

CREATE INDEX IF NOT EXISTS account_privacy_events_user_id_idx
  ON public.account_privacy_events (user_id);

CREATE INDEX IF NOT EXISTS account_privacy_events_created_at_idx
  ON public.account_privacy_events (created_at DESC);

ALTER TABLE public.account_privacy_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.account_privacy_events FROM anon, authenticated;
