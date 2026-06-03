import * as Sentry from "@sentry/nextjs";

const sentryEnabled =
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) &&
  process.env.NODE_ENV === "production";

if (sentryEnabled) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.05,
  });
}

// Não exportar onRouterTransitionStart — incompatível com Next.js 16.2 + Turbopack
// (dispara "Router action dispatched before initialization"). Erros client-side
// continuam capturados via Sentry.init + global-error boundaries.
