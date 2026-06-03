import { isAiMockEnabled, isOpenAiConfigured } from "@/lib/ai/mock";
import { isBillingMockEnabled } from "@/lib/billing/mock";
import { isBillingConfigured } from "@/lib/stripe/config";
import { isStripeConfigured } from "@/lib/stripe/client";
import { env } from "@/config/env";

export type ProductionReadiness = {
  environment: "development" | "production" | "test";
  readyForAi: boolean;
  readyForBilling: boolean;
  readyForProduction: boolean;
  mocks: {
    aiDevMock: boolean;
    billingDevMock: boolean;
  };
  services: {
    openai: boolean;
    stripe: boolean;
    stripeWebhook: boolean;
    stripePrices: boolean;
    serviceRole: boolean;
    upstash: boolean;
    sentry: boolean;
    adminEmails: boolean;
  };
  warnings: string[];
  blockers: string[];
};

function hasUpstash() {
  return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

export function getProductionReadiness(): ProductionReadiness {
  const environment = process.env.NODE_ENV ?? "development";
  const isProd = environment === "production";

  const openai = isOpenAiConfigured();
  const stripe = isStripeConfigured();
  const stripeWebhook = Boolean(env.STRIPE_WEBHOOK_SECRET);
  const stripePrices = isBillingConfigured();
  const serviceRole = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
  const upstash = hasUpstash();
  const sentry = Boolean(env.SENTRY_DSN);
  const adminEmails = Boolean(env.ADMIN_EMAILS?.trim());

  const aiDevMock = isAiMockEnabled();
  const billingDevMock = isBillingMockEnabled();

  const warnings: string[] = [];
  const blockers: string[] = [];

  if (isProd) {
    if (aiDevMock) blockers.push("AI_DEV_MOCK ativo em produção");
    if (billingDevMock) blockers.push("BILLING_DEV_MOCK ativo em produção");
    if (!openai) blockers.push("OPENAI_API_KEY ausente");
    if (!serviceRole) blockers.push("SUPABASE_SERVICE_ROLE_KEY ausente");
    if (!adminEmails) blockers.push("ADMIN_EMAILS ausente");
    if (env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
      blockers.push("NEXT_PUBLIC_APP_URL aponta para localhost");
    }
    if (stripe && !stripeWebhook) {
      blockers.push("STRIPE_WEBHOOK_SECRET ausente com Stripe configurado");
    }
    if (stripe && !stripePrices) {
      blockers.push("STRIPE_PRICE_PRO/FAMILY ausentes");
    }
    if (!upstash) {
      warnings.push(
        "Upstash não configurado — rate limit só por instância Vercel",
      );
    }
    if (!sentry) {
      warnings.push(
        "SENTRY_DSN ausente — monitoramento limitado a Vercel Logs",
      );
    }
  }

  const readyForAi = openai && serviceRole && !aiDevMock;
  const readyForBilling =
    stripe && stripeWebhook && stripePrices && serviceRole && !billingDevMock;
  const readyForProduction = isProd && blockers.length === 0 && readyForAi;

  return {
    environment: environment as ProductionReadiness["environment"],
    readyForAi,
    readyForBilling,
    readyForProduction,
    mocks: { aiDevMock, billingDevMock },
    services: {
      openai,
      stripe,
      stripeWebhook,
      stripePrices,
      serviceRole,
      upstash,
      sentry,
      adminEmails,
    },
    warnings,
    blockers,
  };
}
