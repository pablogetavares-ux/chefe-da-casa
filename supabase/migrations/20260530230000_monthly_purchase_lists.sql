-- Compras do Mês (módulo isolado — não usa shopping_lists)
CREATE TABLE IF NOT EXISTS public.monthly_purchase_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month smallint NOT NULL CHECK (month >= 1 AND month <= 12),
  year smallint NOT NULL CHECK (year >= 2020 AND year <= 2100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.monthly_purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_purchase_list_id uuid NOT NULL REFERENCES public.monthly_purchase_lists(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'OUTROS',
  quantity numeric(12, 3),
  unit text,
  price_paid numeric(12, 2),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS monthly_purchase_lists_user_period_idx
  ON public.monthly_purchase_lists (user_id, year DESC, month DESC);

CREATE INDEX IF NOT EXISTS monthly_purchase_items_list_idx
  ON public.monthly_purchase_items (monthly_purchase_list_id);

ALTER TABLE public.monthly_purchase_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY monthly_purchase_lists_select_own
  ON public.monthly_purchase_lists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY monthly_purchase_lists_insert_own
  ON public.monthly_purchase_lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY monthly_purchase_lists_update_own
  ON public.monthly_purchase_lists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY monthly_purchase_lists_delete_own
  ON public.monthly_purchase_lists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY monthly_purchase_items_select_own
  ON public.monthly_purchase_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY monthly_purchase_items_insert_own
  ON public.monthly_purchase_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY monthly_purchase_items_update_own
  ON public.monthly_purchase_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = auth.uid()
    )
  );

CREATE POLICY monthly_purchase_items_delete_own
  ON public.monthly_purchase_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.monthly_purchase_lists l
      WHERE l.id = monthly_purchase_list_id AND l.user_id = auth.uid()
    )
  );
