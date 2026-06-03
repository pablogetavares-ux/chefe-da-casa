-- Auditoria MCP (maio/2026): alinhado com apply_migration audit_mcp_fixes_may2026

CREATE POLICY revenuecat_webhook_events_deny ON public.revenuecat_webhook_events
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE INDEX IF NOT EXISTS shopping_list_items_recipe_id_idx
  ON public.shopping_list_items (recipe_id)
  WHERE recipe_id IS NOT NULL;
