#!/usr/bin/env node
/**
 * Fase 2 — checklist de go-live (env + checklist remoto opcional).
 * Uso: npm run launch:check
 *      NEXT_PUBLIC_APP_URL=https://seu-dominio.com npm run launch:check
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const SUPABASE_PROJECT_REF = "mnevlegpkrncxlqkqdnl";

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

console.log("=== Go-live — Chefe da Casa (Fase 2) ===\n");

const deployCheck = spawnSync(
  "node",
  ["scripts/check-deploy-env.mjs", "--production"],
  { cwd: root, stdio: "inherit", env: { ...process.env, ...fileEnv } },
);

if (deployCheck.status !== 0) {
  console.log("\n⚠️  Corrija os bloqueadores de env antes do go-live.\n");
}

const baseUrl = get("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
const stripeKey = get("STRIPE_SECRET_KEY");

console.log("\n--- Checklist manual (copie para os painéis) ---\n");

console.log("Vercel");
console.log(`  • Domínio → Settings → Domains`);
console.log(
  `  • NEXT_PUBLIC_APP_URL=${baseUrl || "https://SEU-DOMINIO.vercel.app"}`,
);
console.log(`  • AI_DEV_MOCK=false | BILLING_DEV_MOCK=false\n`);

console.log("Supabase Auth");
console.log(
  `  • Dashboard: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/url-configuration`,
);
console.log(`  • Site URL: ${baseUrl || "https://SEU-DOMINIO"}`);
console.log(
  `  • Redirect URLs: ${baseUrl || "https://SEU-DOMINIO"}/auth/callback`,
);
console.log(
  `  • Leaked Password Protection: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/providers\n`,
);

console.log("Stripe");
console.log(
  `  • Modo: ${stripeKey.startsWith("sk_live_") ? "LIVE ✓" : stripeKey.startsWith("sk_test_") ? "TEST (trocar para live)" : "não configurado"}`,
);
console.log(
  `  • Webhook: ${baseUrl || "https://SEU-DOMINIO"}/api/webhooks/stripe`,
);
console.log(
  "  • Eventos: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed",
);
console.log(
  "  • Customer Portal: https://dashboard.stripe.com/settings/billing/portal\n",
);

console.log("Monitoramento");
console.log(`  • Health: ${baseUrl || "https://SEU-DOMINIO"}/api/health`);
console.log(
  `  • Launch checklist API: ${baseUrl || "https://SEU-DOMINIO"}/api/v1/launch-checklist`,
);
console.log("  • Sentry + Upstash (recomendado)\n");

if (!baseUrl || baseUrl.includes("localhost")) {
  console.log(
    "ℹ️  Checklist remoto ignorado — defina NEXT_PUBLIC_APP_URL com domínio real após deploy.\n",
  );
  process.exit(deployCheck.status ?? 0);
}

async function fetchJson(path) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

console.log(`--- Checklist remoto: ${baseUrl} ---\n`);

try {
  const launch = await fetchJson("/api/v1/launch-checklist");
  const data = launch.body?.data ?? launch.body;

  console.log(`GET /api/v1/launch-checklist → ${launch.status}`);
  console.log(`  codeComplete: ${data.codeComplete}`);
  console.log(`  readyToLaunch: ${data.readyToLaunch}`);
  console.log(`  externalStepsRemaining: ${data.externalStepsRemaining}`);
  console.log(`  stripe.liveMode: ${data.stripe?.liveMode}\n`);

  if (data.checklist?.length) {
    console.log("Passos pendentes:");
    for (const step of data.checklist) {
      if (step.status === "done") continue;
      const icon = step.status === "warning" ? "⚠" : "○";
      console.log(`  ${icon} [${step.category}] ${step.title}`);
      if (step.action) console.log(`      → ${step.action}`);
    }
    console.log("");
  }

  if (data.readyToLaunch) {
    console.log("✅ Pronto para go-live comercial.\n");
  } else {
    console.log("⏳ Código completo — conclua os passos externos acima.\n");
  }
} catch (error) {
  console.error("❌ Falha ao consultar checklist remoto:", error.message);
  console.log("Deploy ainda não publicado ou URL incorreta.\n");
  process.exit(1);
}
