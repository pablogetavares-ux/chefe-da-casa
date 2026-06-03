ALTER TABLE public.monthly_purchase_items
  ADD COLUMN IF NOT EXISTS is_purchased boolean NOT NULL DEFAULT false;

UPDATE public.monthly_purchase_items
SET category = 'MERCEARIA'
WHERE category = 'LATICINIOS';

CREATE INDEX IF NOT EXISTS monthly_purchase_items_list_purchased_idx
  ON public.monthly_purchase_items (monthly_purchase_list_id, is_purchased);
