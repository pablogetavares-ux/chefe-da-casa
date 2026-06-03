-- Índices para auditoria de webhooks Stripe em produção

CREATE INDEX IF NOT EXISTS stripe_webhook_events_processed_at_idx
  ON public.stripe_webhook_events (processed_at DESC);

CREATE INDEX IF NOT EXISTS stripe_webhook_events_event_type_idx
  ON public.stripe_webhook_events (event_type, processed_at DESC);
