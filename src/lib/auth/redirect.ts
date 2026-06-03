const DEFAULT_REDIRECT = "/app";

const BLOCKED_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/",
  "/apple-icon",
  "/icon",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/api/",
  "/_next/",
];

/** Evita open redirect — só paths internos seguros. */
export function getSafeRedirectPath(
  next: string | null | undefined,
  fallback = DEFAULT_REDIRECT,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  const path = next.split("?")[0] ?? next;

  if (BLOCKED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return fallback;
  }

  return next;
}

export const AUTH_CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_failed:
    "Não foi possível concluir a autenticação. Tente entrar novamente.",
};

export function getAuthCallbackErrorMessage(code: string | null | undefined) {
  if (!code) return undefined;
  return (
    AUTH_CALLBACK_ERRORS[code] ?? AUTH_CALLBACK_ERRORS.auth_callback_failed
  );
}
