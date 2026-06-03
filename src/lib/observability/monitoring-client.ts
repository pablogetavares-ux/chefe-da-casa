"use client";

/** Captura erros client-side (global-error, error boundaries). */
export function captureClientException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  console.error("[client-error]", error, context);

  if (
    !process.env.NEXT_PUBLIC_SENTRY_DSN ||
    process.env.NODE_ENV !== "production"
  ) {
    return;
  }

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureException(error, { extra: context });
  });
}
