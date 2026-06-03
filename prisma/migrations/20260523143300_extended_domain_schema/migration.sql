-- Extended domain schema: ingredients, favorites, shopping lists, subscriptions, ai_generations
-- RLS: user-owned data isolated by auth.uid(); nested tables inherit via parent FK

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE "SubscriptionStatus" AS ENUM (
  'ACTIVE',
  'CANCELED',
  'PAST_DUE',
  'TRIALING',
  'INCOMPLETE',
  'UNPAID'
);

CREATE TYPE "AiGenerationStatus" AS ENUM (
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELED'
);

-- ─── Ingredients (catalog) ───────────────────────────────────────────────────

CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text,
  is_system boolean NOT NULL DEFAULT false,
  created_by_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ingredients_category_idx ON public.ingredients(category);
CREATE INDEX ingredients_created_by_id_idx ON public.ingredients(created_by_id);

CREATE TRIGGER ingredients_set_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Recipe ingredients (junction) ───────────────────────────────────────────

CREATE TABLE public.recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  quantity double precision,
  unit text,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recipe_ingredients_recipe_id_idx ON public.recipe_ingredients(recipe_id);
CREATE INDEX recipe_ingredients_ingredient_id_idx ON public.recipe_ingredients(ingredient_id);

-- ─── Pantry: link optional to catalog ──────────────────────────────────────

ALTER TABLE public.pantry_items
  ADD COLUMN ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL;

CREATE INDEX pantry_items_ingredient_id_idx ON public.pantry_items(ingredient_id);

-- ─── Favorites ───────────────────────────────────────────────────────────────

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_user_recipe_unique UNIQUE (user_id, recipe_id)
);

CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_recipe_id_idx ON public.favorites(recipe_id);

-- ─── Shopping lists ──────────────────────────────────────────────────────────

CREATE TABLE public.shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Lista de compras',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX shopping_lists_user_id_idx ON public.shopping_lists(user_id);
CREATE INDEX shopping_lists_user_id_updated_at_idx ON public.shopping_lists(user_id, updated_at DESC);

CREATE TRIGGER shopping_lists_set_updated_at
  BEFORE UPDATE ON public.shopping_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES public.ingredients(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity double precision,
  unit text,
  is_checked boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX shopping_list_items_shopping_list_id_idx ON public.shopping_list_items(shopping_list_id);
CREATE INDEX shopping_list_items_ingredient_id_idx ON public.shopping_list_items(ingredient_id);

CREATE TRIGGER shopping_list_items_set_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── Subscriptions (Stripe) ──────────────────────────────────────────────────

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  plan "PlanTier" NOT NULL DEFAULT 'FREE',
  status "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_user_id_status_idx ON public.subscriptions(user_id, status);
CREATE INDEX subscriptions_stripe_customer_id_idx ON public.subscriptions(stripe_customer_id);

CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── AI generations ──────────────────────────────────────────────────────────

CREATE TABLE public.ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  model text NOT NULL,
  status "AiGenerationStatus" NOT NULL DEFAULT 'PENDING',
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_snapshot jsonb,
  error_message text,
  latency_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_generations_user_id_created_at_idx ON public.ai_generations(user_id, created_at DESC);
CREATE INDEX ai_generations_recipe_id_idx ON public.ai_generations(recipe_id);
CREATE INDEX ai_generations_status_idx ON public.ai_generations(status);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- ingredients: read catalog; manage own custom entries
CREATE POLICY ingredients_select_authenticated ON public.ingredients
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY ingredients_insert_own_custom ON public.ingredients
  FOR INSERT TO authenticated
  WITH CHECK (
    is_system = false
    AND created_by_id = (SELECT auth.uid())
  );

CREATE POLICY ingredients_update_own_custom ON public.ingredients
  FOR UPDATE TO authenticated
  USING (
    is_system = false
    AND created_by_id = (SELECT auth.uid())
  )
  WITH CHECK (
    is_system = false
    AND created_by_id = (SELECT auth.uid())
  );

CREATE POLICY ingredients_delete_own_custom ON public.ingredients
  FOR DELETE TO authenticated
  USING (
    is_system = false
    AND created_by_id = (SELECT auth.uid())
  );

-- recipe_ingredients: via recipe ownership
CREATE POLICY recipe_ingredients_select_own ON public.recipe_ingredients
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY recipe_ingredients_insert_own ON public.recipe_ingredients
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY recipe_ingredients_update_own ON public.recipe_ingredients
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY recipe_ingredients_delete_own ON public.recipe_ingredients
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND r.user_id = (SELECT auth.uid())
    )
  );

-- favorites
CREATE POLICY favorites_select_own ON public.favorites
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY favorites_insert_own ON public.favorites
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY favorites_delete_own ON public.favorites
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- shopping_lists
CREATE POLICY shopping_lists_select_own ON public.shopping_lists
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY shopping_lists_insert_own ON public.shopping_lists
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY shopping_lists_update_own ON public.shopping_lists
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY shopping_lists_delete_own ON public.shopping_lists
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- shopping_list_items: via list ownership
CREATE POLICY shopping_list_items_select_own ON public.shopping_list_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_items.shopping_list_id
        AND sl.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY shopping_list_items_insert_own ON public.shopping_list_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_items.shopping_list_id
        AND sl.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY shopping_list_items_update_own ON public.shopping_list_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_items.shopping_list_id
        AND sl.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_items.shopping_list_id
        AND sl.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY shopping_list_items_delete_own ON public.shopping_list_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_items.shopping_list_id
        AND sl.user_id = (SELECT auth.uid())
    )
  );

-- subscriptions: read own; writes via service role (Stripe webhooks)
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ai_generations
CREATE POLICY ai_generations_select_own ON public.ai_generations
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY ai_generations_insert_own ON public.ai_generations
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY ai_generations_update_own ON public.ai_generations
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Seed: common system ingredients
INSERT INTO public.ingredients (name, slug, category, is_system) VALUES
  ('Arroz', 'arroz', 'grãos', true),
  ('Feijão', 'feijao', 'grãos', true),
  ('Ovo', 'ovo', 'proteínas', true),
  ('Frango', 'frango', 'proteínas', true),
  ('Tomate', 'tomate', 'vegetais', true),
  ('Cebola', 'cebola', 'vegetais', true),
  ('Alho', 'alho', 'temperos', true),
  ('Azeite', 'azeite', 'temperos', true),
  ('Sal', 'sal', 'temperos', true),
  ('Leite', 'leite', 'laticínios', true)
ON CONFLICT (slug) DO NOTHING;
