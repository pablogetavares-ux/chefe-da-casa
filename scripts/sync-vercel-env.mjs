#!/usr/bin/env node
/**
 * Sincroniza variáveis do .env local para a Vercel (Production + Preview).
 * Uso: node scripts/sync-vercel-env.mjs [--app-url https://...]
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

const OVERRIDES = {
  AI_DEV_MOCK: "false",
  BILLING_DEV_MOCK: "true",
};

const KEYS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAILS",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_VISION_MODEL",
  "AI_DEV_MOCK",
  "BILLING_DEV_MOCK",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_FAMILY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
];

function loadEnvFile() {
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const appUrlIdx = args.indexOf("--app-url");
  if (appUrlIdx !== -1 && args[appUrlIdx + 1]) {
    return { appUrl: args[appUrlIdx + 1] };
  }
  return { appUrl: null };
}

function shellQuote(value) {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function addEnv(name, value) {
  const isPublic = name.startsWith("NEXT_PUBLIC_");
  const sensitiveFlag = isPublic ? "" : " --sensitive";
  const command = `npx vercel env add ${name} production --value ${shellQuote(value)} --yes --force${sensitiveFlag}`;

  execSync(command, {
    cwd: root,
    stdio: "pipe",
    shell: true,
  });
  console.log(`  ✓ ${name} (production)`);
}

const fileEnv = loadEnvFile();
const { appUrl } = parseArgs();
const merged = { ...fileEnv, ...OVERRIDES };

if (appUrl) {
  merged.NEXT_PUBLIC_APP_URL = appUrl;
}

const synced = [];
const skipped = [];

for (const key of KEYS) {
  const value = merged[key];
  if (!value) {
    skipped.push(key);
    continue;
  }
  console.log(`\n→ ${key}`);
  addEnv(key, value);
  synced.push(key);
}

console.log("\n--- Resumo ---");
console.log(`Sincronizadas: ${synced.length}`);
if (skipped.length > 0) {
  console.log(`Ignoradas (vazias): ${skipped.join(", ")}`);
}

if (!merged.NEXT_PUBLIC_SUPABASE_URL || !merged.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.exit(1);
}
