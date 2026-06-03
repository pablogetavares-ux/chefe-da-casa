-- Weekly meal plans (applied via MCP: weekly_meal_plans)
CREATE TABLE IF NOT EXISTS public.weekly_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal text NOT NULL CHECK (goal IN ('economizar', 'saude', 'proteina')),
  starts_on date NOT NULL DEFAULT (CURRENT_DATE),
  plan_json jsonb NOT NULL,
  total_cost numeric(12,2),
  cheapest_market text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS weekly_meal_plans_user_created_idx
  ON public.weekly_meal_plans (user_id, created_at DESC);

ALTER TABLE public.weekly_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY weekly_meal_plans_select_own
  ON public.weekly_meal_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY weekly_meal_plans_insert_own
  ON public.weekly_meal_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY weekly_meal_plans_delete_own
  ON public.weekly_meal_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
