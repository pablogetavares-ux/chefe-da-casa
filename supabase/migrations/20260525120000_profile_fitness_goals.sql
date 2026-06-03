-- Receitas adaptadas ao objetivo físico: peso, altura e objetivo no perfil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS body_weight_kg numeric(5, 2)
    CHECK (
      body_weight_kg IS NULL
      OR (body_weight_kg >= 30 AND body_weight_kg <= 300)
    ),
  ADD COLUMN IF NOT EXISTS body_height_cm numeric(5, 1)
    CHECK (
      body_height_cm IS NULL
      OR (body_height_cm >= 100 AND body_height_cm <= 250)
    ),
  ADD COLUMN IF NOT EXISTS fitness_goal text
    CHECK (
      fitness_goal IS NULL
      OR fitness_goal IN ('lose_weight', 'gain_muscle', 'maintain')
    );

COMMENT ON COLUMN public.profiles.body_weight_kg IS
  'Peso corporal (kg) para calcular metas nutricionais nas receitas fitness';
COMMENT ON COLUMN public.profiles.body_height_cm IS
  'Altura (cm) para calcular metas nutricionais nas receitas fitness';
COMMENT ON COLUMN public.profiles.fitness_goal IS
  'Objetivo físico: lose_weight, gain_muscle ou maintain';
