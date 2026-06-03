#!/usr/bin/env node
/**
 * Valida variáveis antes do deploy na Vercel.
 * Modos: DEPLOY_CHECK_MODE=local|ci|production
 * Uso: node scripts/check-deploy-env.mjs
 *      node scripts/check-deploy-env.mjs --production
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

function loadEnvFile() {
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const fileEnv = loadEnvFile();

function get(name) {
  return process.env[name] || fileEnv[name] || "";
}

const warnings = [];
const errors = [];
const ok = [];
const appUrl = get("NEXT_PUBLIC_APP_URL");

const mode = process.argv.includes("--production")
  ? "production"
  : (process.env.DEPLOY_CHECK_MODE ??
    (process.env.VERCEL_ENV === "production"
      ? "production"
      : process.env.CI === "true"
        ? "ci"
        : "local"));

const required = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const recommendedProd = [
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_FAMILY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

for (const key of required) {
  if (!get(key)) errors.push(`Obrigatória ausente: ${key}`);
  else ok.push(`${key} OK`);
}

if (mode === "ci") {
  warnings.push("Modo CI — validação mínima (sem secrets de produção)");
} else if (mode === "production") {
  for (const key of [
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_EMAILS",
    "OPENAI_API_KEY",
  ]) {
    if (!get(key)) errors.push(`Obrigatória em produção: ${key}`);
    else ok.push(`${key} OK`);
  }

  if (get("BILLING_DEV_MOCK") === "true") {
    errors.push("BILLING_DEV_MOCK deve ser false em produção");
  }
  if (get("AI_DEV_MOCK") === "true") {
    errors.push("AI_DEV_MOCK deve ser false em produção");
  }
  if (appUrl.includes("localhost")) {
    errors.push("NEXT_PUBLIC_APP_URL não pode ser localhost em produção");
  }

  const stripeKey = get("STRIPE_SECRET_KEY");
  if (stripeKey) {
    ok.push("STRIPE_SECRET_KEY OK");
    if (!get("STRIPE_WEBHOOK_SECRET")) {
      errors.push(
        "STRIPE_WEBHOOK_SECRET obrigatório quando Stripe está configurado",
      );
    }
    if (!get("STRIPE_PRICE_PRO") || !get("STRIPE_PRICE_FAMILY")) {
      errors.push("STRIPE_PRICE_PRO e STRIPE_PRICE_FAMILY obrigatórios");
    }
    if (!get("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")) {
      warnings.push(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ausente (checkout client)",
      );
    }
    if (stripeKey.startsWith("sk_test_")) {
      warnings.push(
        "STRIPE_SECRET_KEY é sk_test_ — use sk_live_ para cobrança real",
      );
    }
  } else {
    warnings.push("STRIPE_SECRET_KEY ausente — billing desabilitado");
  }

  for (const key of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) {
    if (!get(key)) {
      warnings.push(
        `${key} ausente — rate limit não distribuído entre instâncias`,
      );
    } else {
      ok.push(`${key} OK`);
    }
  }

  if (!get("SENTRY_DSN")) {
    warnings.push("SENTRY_DSN ausente — erros só em Vercel Logs");
  }

  for (const key of recommendedProd) {
    if (!get(key) && !key.startsWith("UPSTASH") && !key.includes("STRIPE")) {
      /* já checado acima */
    }
  }
} else {
  if (!get("SUPABASE_SERVICE_ROLE_KEY")) {
    warnings.push(
      "SUPABASE_SERVICE_ROLE_KEY ausente — rotas de IA precisam dela",
    );
  }
  if (get("AI_DEV_MOCK") === "true" && !get("OPENAI_API_KEY")) {
    ok.push("IA em modo mock (dev local)");
  }
  if (appUrl.includes("localhost") && mode === "local") {
    warnings.push(
      "NEXT_PUBLIC_APP_URL aponta para localhost — altere na Vercel em produção",
    );
  }
}

console.log(`Chef da Casa AI — verificação de deploy (${mode})\n`);

if (ok.length) {
  console.log("✅ Configurado:");
  ok.forEach((m) => console.log(`  • ${m}`));
}

if (errors.length) {
  console.log("\n❌ Bloqueadores:");
  errors.forEach((e) => console.log(`  - ${e}`));
}

if (warnings.length) {
  console.log("\n⚠️  Avisos:");
  warnings.forEach((w) => console.log(`  - ${w}`));
}

if (!errors.length && !warnings.length) {
  console.log("\n✅ Variáveis OK para deploy.");
}

if (errors.length) {
  process.exit(1);
}

console.log("\nPróximos passos:");
console.log(
  "  1. npm run production:check   (valida /api/health remoto, se URL definida)",
);
console.log("  2. docs/DEPLOY.md — Stripe webhook + Supabase redirects");
console.log("  3. Vercel → Redeploy após alterar env vars\n");
