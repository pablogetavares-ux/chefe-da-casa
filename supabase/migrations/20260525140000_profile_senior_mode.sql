-- Modo idoso: preferência no perfil para receitas simples, macias e nutritivas
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS senior_mode_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.senior_mode_enabled IS
  'Prioriza receitas do modo idoso (simples, fáceis de mastigar, nutritivas)';
