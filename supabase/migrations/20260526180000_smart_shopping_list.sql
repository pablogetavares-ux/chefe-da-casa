-- Smart shopping list: categorias, origem, ofertas, receitas, realtime

ALTER TABLE shopping_list_items
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'OUTROS',
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_id uuid REFERENCES regional_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unit_price numeric(10, 2),
  ADD COLUMN IF NOT EXISTS estimated_savings numeric(10, 2);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shopping_list_items_source_check'
  ) THEN
    ALTER TABLE shopping_list_items
      ADD CONSTRAINT shopping_list_items_source_check
      CHECK (source IN ('manual', 'recipe', 'offer', 'ai'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS shopping_list_items_category_idx
  ON shopping_list_items(category);

CREATE INDEX IF NOT EXISTS shopping_list_items_shopping_list_category_idx
  ON shopping_list_items(shopping_list_id, category);

CREATE INDEX IF NOT EXISTS shopping_list_items_offer_id_idx
  ON shopping_list_items(offer_id)
  WHERE offer_id IS NOT NULL;

-- Realtime para sync entre abas/dispositivos
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list_items;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
