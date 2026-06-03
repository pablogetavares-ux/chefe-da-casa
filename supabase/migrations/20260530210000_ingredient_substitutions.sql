-- Ingredient substitutions (applied via MCP: ingredient_substitutions)
CREATE TABLE IF NOT EXISTS public.ingredient_substitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name text NOT NULL,
  substitute_name text NOT NULL,
  reason text NOT NULL,
  original_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  substitute_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ingredient_substitutions_unique_pair UNIQUE (original_name, substitute_name)
);

CREATE INDEX IF NOT EXISTS ingredient_substitutions_original_idx
  ON public.ingredient_substitutions (lower(original_name));

CREATE INDEX IF NOT EXISTS ingredient_substitutions_active_idx
  ON public.ingredient_substitutions (is_active) WHERE is_active = true;

COMMENT ON TABLE public.ingredient_substitutions IS
  'Substituições de ingredientes (ex.: peito de frango → frango inteiro) para economia.';

ALTER TABLE public.ingredient_substitutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ingredient_substitutions_select_authenticated
  ON public.ingredient_substitutions FOR SELECT
  TO authenticated
  USING (is_active = true);

INSERT INTO public.ingredient_substitutions (original_name, substitute_name, reason, substitute_product_id)
SELECT 'arroz branco', p.name, 'Pacote maior costuma sair mais barato por kg', p.id
FROM public.products p WHERE p.slug = 'arroz-branco-5kg'
ON CONFLICT (original_name, substitute_name) DO NOTHING;

INSERT INTO public.ingredient_substitutions (original_name, substitute_name, reason, substitute_product_id)
SELECT 'arroz', p.name, 'Use arroz em pacote econômico da mesma linha', p.id
FROM public.products p WHERE p.slug = 'arroz-branco-5kg'
ON CONFLICT (original_name, substitute_name) DO NOTHING;

INSERT INTO public.ingredient_substitutions (original_name, substitute_name, reason, substitute_product_id)
SELECT 'tomate', p.name, 'Tomate italiano em promoção nos mercados cadastrados', p.id
FROM public.products p WHERE p.slug = 'tomate-italiano'
ON CONFLICT (original_name, substitute_name) DO NOTHING;

INSERT INTO public.ingredient_substitutions (original_name, substitute_name, reason, substitute_product_id)
SELECT 'ovo', p.name, 'Dúzia de ovos — compare preços entre mercados', p.id
FROM public.products p WHERE p.slug = 'ovos-brancos-duzia'
ON CONFLICT (original_name, substitute_name) DO NOTHING;

INSERT INTO public.ingredient_substitutions (original_name, substitute_name, reason, substitute_product_id)
SELECT 'ovos', p.name, 'Dúzia de ovos — compare preços entre mercados', p.id
FROM public.products p WHERE p.slug = 'ovos-brancos-duzia'
ON CONFLICT (original_name, substitute_name) DO NOTHING;

INSERT INTO public.ingredient_substitutions (original_name, substitute_name, reason)
VALUES
  ('peito de frango', 'frango inteiro', 'O frango inteiro costuma ser mais econômico por kg; use cortes conforme a receita'),
  ('filé de frango', 'frango inteiro', 'Compre o frango inteiro e divida em porções'),
  ('azeite extra virgem', 'azeite comum', 'Para refogados, azeite comum ou mistura reduz custo'),
  ('feijão preto', 'feijão carioca', 'Feijão carioca frequentemente mais acessível na região')
ON CONFLICT (original_name, substitute_name) DO NOTHING;

UPDATE public.ingredient_substitutions s
SET substitute_product_id = p.id
FROM public.products p
WHERE s.substitute_name ILIKE '%feijão%'
  AND p.slug = 'feijao-carioca-1kg'
  AND s.substitute_product_id IS NULL;
