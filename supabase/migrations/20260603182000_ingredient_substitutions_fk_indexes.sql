-- FK indexes flagged by Supabase performance advisor

CREATE INDEX IF NOT EXISTS ingredient_substitutions_original_product_id_idx
  ON public.ingredient_substitutions (original_product_id);

CREATE INDEX IF NOT EXISTS ingredient_substitutions_substitute_product_id_idx
  ON public.ingredient_substitutions (substitute_product_id);
