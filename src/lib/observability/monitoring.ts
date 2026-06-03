import { logger } from "@/lib/observability/logger";

export function isMonitoringEnabled() {
  return Boolean(process.env.SENTRY_DSN);
}

/** Compatível com instrumentation.ts — Sentry inicializa via sentry.server.config.ts */
export async function initServerMonitoring() {
  // Sentry é carregado em instrumentation.ts antes desta chamada.
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error("exception", { message, stack, ...context });

  if (!process.env.SENTRY_DSN || process.env.NODE_ENV !== "production") return;

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureException(error, { extra: context });
  });
}
