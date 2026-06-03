-- Evite desperdício: tipo de item (estoque vs sobra) e notas de reaproveitamento
ALTER TABLE public.pantry_items
  ADD COLUMN IF NOT EXISTS item_kind text NOT NULL DEFAULT 'stock'
    CHECK (item_kind IN ('stock', 'leftover')),
  ADD COLUMN IF NOT EXISTS notes text;

COMMENT ON COLUMN public.pantry_items.item_kind IS
  'stock = ingrediente normal; leftover = sobra/prato pronto para reaproveitar';
COMMENT ON COLUMN public.pantry_items.notes IS
  'Contexto opcional (ex: feijão de ontem, frango assado sobrando)';

CREATE INDEX IF NOT EXISTS pantry_items_user_kind_idx
  ON public.pantry_items (user_id, item_kind);

CREATE INDEX IF NOT EXISTS pantry_items_user_expires_idx
  ON public.pantry_items (user_id, expires_at)
  WHERE expires_at IS NOT NULL;
