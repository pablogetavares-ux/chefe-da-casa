export const CAPTCHA_FORM_FIELD = "captchaToken";

export type CaptchaValidationResult = { error: string } | null;

export function isCaptchaEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

export function readCaptchaToken(formData: FormData): string | undefined {
  const value = formData.get(CAPTCHA_FORM_FIELD);
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Retorna erro de validação ou null se OK. */
export function validateCaptchaToken(
  token: string | undefined,
): CaptchaValidationResult {
  if (!isCaptchaEnabled()) return null;
  if (!token) {
    return { error: "Confirme a verificação de segurança antes de continuar." };
  }
  return null;
}

export function captchaAuthOptions(token: string | undefined) {
  if (!isCaptchaEnabled() || !token) return undefined;
  return { captchaToken: token };
}
