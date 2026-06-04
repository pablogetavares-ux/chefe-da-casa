import { env } from "@/config/env";
import {
  getProductionReadiness,
  type ProductionReadiness,
} from "@/lib/runtime/production-readiness";

export type LaunchStepStatus = "done" | "pending" | "warning";

export type LaunchChecklistItem = {
  id: string;
  category: "code" | "vercel" | "stripe" | "supabase" | "monitoring";
  title: string;
  status: LaunchStepStatus;
  detail?: string;
  action?: string;
  url?: string;
};

export type LaunchReadiness = {
  codeComplete: boolean;
  readyToLaunch: boolean;
  externalStepsRemaining: number;
  production: ProductionReadiness;
  urls: {
    app: string;
    supabase: string;
    supabaseAuthSettings: string;
    authCallback: string;
    stripeWebhook: string;
    health: string;
    status: string;
    launchChecklist: string;
  };
  stripe: {
    configured: boolean;
    liveMode: boolean;
    testMode: boolean;
    publishableKeySet: boolean;
  };
  checklist: LaunchChecklistItem[];
};

const SUPABASE_PROJECT_REF = "mnevlegpkrncxlqkqdnl";

function appBaseUrl() {
  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}

function stripeSecretMode() {
  const key = env.STRIPE_SECRET_KEY ?? "";
  if (key.startsWith("sk_live_")) return "live" as const;
  if (key.startsWith("sk_test_")) return "test" as const;
  return "unknown" as const;
}

function item(
  partial: LaunchChecklistItem & { status: LaunchStepStatus },
): LaunchChecklistItem {
  return partial;
}

export function getLaunchReadiness(): LaunchReadiness {
  const production = getProductionReadiness();
  const base = appBaseUrl();
  const isProd = production.environment === "production";
  const stripeMode = stripeSecretMode();
  const stripeConfigured = production.services.stripe;
  const stripeLive = stripeMode === "live";
  const stripeTest = stripeMode === "test";
  const publishableKeySet = Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const hasRealDomain = !base.includes("localhost");

  const checklist: LaunchChecklistItem[] = [
    item({
      id: "code-core",
      category: "code",
      title: "Funcionalidades core (auth, IA, billing, LGPD)",
      status: "done",
      detail: "Implementado no repositório",
    }),
    item({
      id: "code-tests",
      category: "code",
      title: "Testes unitários e CI",
      status: "done",
      detail: "npm run test + GitHub Actions",
    }),
    item({
      id: "code-security",
      category: "code",
      title: "RLS, audit tables e rate limits",
      status: "done",
      detail: "Migrations aplicadas via Supabase MCP",
    }),
    item({
      id: "vercel-env",
      category: "vercel",
      title: "Variáveis de ambiente na Vercel (Production)",
      status: isProd && production.blockers.length === 0 ? "done" : "pending",
      action: "Copiar .env.production.example → Vercel → Environment Variables",
      url: "https://vercel.com/docs/projects/environment-variables",
    }),
    item({
      id: "vercel-domain",
      category: "vercel",
      title: "Domínio customizado configurado",
      status: hasRealDomain ? "done" : "pending",
      action: "Vercel → Settings → Domains + atualizar NEXT_PUBLIC_APP_URL",
      detail: hasRealDomain ? base : "NEXT_PUBLIC_APP_URL ainda é localhost",
    }),
    item({
      id: "vercel-deploy",
      category: "vercel",
      title: "Deploy de produção publicado",
      status: hasRealDomain && isProd ? "warning" : "pending",
      action: "Push em main → verificar GET /api/health",
      url: `${base}/api/health`,
    }),
    item({
      id: "stripe-live",
      category: "stripe",
      title: "Stripe em modo live (sk_live_)",
      status: !stripeConfigured ? "pending" : stripeLive ? "done" : "warning",
      action: "Stripe Dashboard → Developers → API keys → Live mode",
      url: "https://dashboard.stripe.com/apikeys",
      detail: stripeTest ? "STRIPE_SECRET_KEY ainda é sk_test_" : undefined,
    }),
    item({
      id: "stripe-prices",
      category: "stripe",
      title: "Preços Pro e Família (STRIPE_PRICE_*)",
      status: production.services.stripePrices ? "done" : "pending",
      action: "Criar produtos/preços mensais e copiar price_ IDs",
      url: "https://dashboard.stripe.com/products",
    }),
    item({
      id: "stripe-webhook",
      category: "stripe",
      title: "Webhook Stripe apontando para produção",
      status:
        stripeConfigured && production.services.stripeWebhook && hasRealDomain
          ? "done"
          : "pending",
      action: `Cadastrar endpoint ${base}/api/webhooks/stripe`,
      url: "https://dashboard.stripe.com/webhooks",
      detail:
        "Eventos: checkout.session.completed, customer.subscription.*, invoice.payment_failed",
    }),
    item({
      id: "stripe-portal",
      category: "stripe",
      title: "Customer Portal habilitado",
      status: "pending",
      action: "Stripe → Settings → Billing → Customer portal",
      url: "https://dashboard.stripe.com/settings/billing/portal",
    }),
    item({
      id: "supabase-auth-urls",
      category: "supabase",
      title: "Supabase Auth — Site URL e Redirect URLs",
      status: hasRealDomain ? "warning" : "pending",
      action: `Site URL: ${base} | Redirect: ${base}/auth/callback`,
      url: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/url-configuration`,
    }),
    item({
      id: "supabase-leaked-passwords",
      category: "supabase",
      title: "Leaked Password Protection (HaveIBeenPwned)",
      status: "warning",
      detail: "Disponível apenas no Supabase Pro ou superior",
      action:
        "No Free: reforçar requisitos de senha no Auth. No Pro: Auth → Providers → Email → Prevent use of leaked passwords",
      url: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/providers`,
    }),
    item({
      id: "monitoring-sentry",
      category: "monitoring",
      title: "Sentry configurado (SENTRY_DSN)",
      status: production.services.sentry ? "done" : "warning",
      action: "Opcional mas recomendado para produção",
      url: "https://sentry.io",
    }),
    item({
      id: "monitoring-upstash",
      category: "monitoring",
      title: "Upstash Redis (rate limit distribuído)",
      status: production.services.upstash ? "done" : "warning",
      action: "UPSTASH_REDIS_REST_URL + TOKEN na Vercel",
      url: "https://console.upstash.com",
    }),
    item({
      id: "monitoring-uptime",
      category: "monitoring",
      title: "Monitor de uptime externo",
      status: hasRealDomain ? "pending" : "pending",
      action: `UptimeRobot ou similar em ${base}/api/health`,
      url: "https://uptimerobot.com",
    }),
  ];

  const externalStepsRemaining = checklist.filter(
    (step) => step.status !== "done",
  ).length;

  const readyToLaunch =
    production.readyForProduction &&
    production.readyForBilling &&
    stripeLive &&
    hasRealDomain &&
    externalStepsRemaining <= 3;

  return {
    codeComplete: true,
    readyToLaunch,
    externalStepsRemaining,
    production,
    urls: {
      app: base,
      supabase: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAuthSettings: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/url-configuration`,
      authCallback: `${base}/auth/callback`,
      stripeWebhook: `${base}/api/webhooks/stripe`,
      health: `${base}/api/health`,
      status: `${base}/api/v1/status`,
      launchChecklist: `${base}/api/v1/launch-checklist`,
    },
    stripe: {
      configured: stripeConfigured,
      liveMode: stripeLive,
      testMode: stripeTest,
      publishableKeySet,
    },
    checklist,
  };
}
