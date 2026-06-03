-- Corrige signup: confirmation_token NULL quebrava o API auth do Supabase
-- Erro: "converting NULL to string is unsupported" após sign-up

CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $function$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at = NOW();
  END IF;

  NEW.raw_user_meta_data = jsonb_set(
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    '{email_verified}',
    'true'::jsonb,
    true
  );

  RETURN NEW;
END;
$function$;
