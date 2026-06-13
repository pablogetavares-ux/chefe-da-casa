#!/usr/bin/env node
/**
 * Abre o Supabase Dashboard e grava SUPABASE_SERVICE_ROLE_KEY
 * quando você copiar a chave service_role (Ctrl+C no dashboard).
 *
 * Uso: node scripts/capture-service-role.mjs
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_REF = "mnevlegpkrncxlqkqdnl";
const envPath = resolve(import.meta.dirname, "..", ".env");
const DASHBOARD_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api`;

function readClipboard() {
  try {
    return execSync('powershell -NoProfile -Command "Get-Clipboard -Raw"', {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function isServiceRoleKey(value) {
  const trimmed = value.trim().replace(/\.$/, "");
  if (trimmed.startsWith("sb_secret_")) return trimmed.length > 20;
  if (!trimmed.startsWith("eyJ") || trimmed.split(".").length !== 3)
    return false;
  try {
    const payload = JSON.parse(
      Buffer.from(trimmed.split(".")[1], "base64url").toString("utf8"),
    );
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function normalizeServiceRoleKey(value) {
  return value.trim().replace(/\.$/, "");
}

function upsertEnv(key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  content = re.test(content)
    ? content.replace(re, `${key}=${value}`)
    : `${content.trimEnd()}\n${key}=${value}\n`;
  writeFileSync(envPath, content, "utf8");
}

function openBrowser(url) {
  spawn("cmd", ["/c", "start", "", url], {
    detached: true,
    stdio: "ignore",
  }).unref();
}

console.log("\n🔑 Chefe da Casa — configurar service_role\n");
console.log("1. O navegador vai abrir em Settings → API");
console.log(
  "2. API Keys → secret (sb_secret_...) ou Legacy → service_role (eyJ...)",
);
console.log("3. Clique em COPY ao lado de service_role");
console.log("4. Este script detecta automaticamente (aguardando até 3 min)\n");

openBrowser(DASHBOARD_URL);

const started = Date.now();
const timeoutMs = 3 * 60 * 1000;
let lastClip = "";

const timer = setInterval(() => {
  const clip = readClipboard();
  if (clip && clip !== lastClip && isServiceRoleKey(clip)) {
    clearInterval(timer);
    upsertEnv("SUPABASE_SERVICE_ROLE_KEY", normalizeServiceRoleKey(clip));
    console.log("✅ SUPABASE_SERVICE_ROLE_KEY gravada no .env!");
    console.log("\nReinicie o servidor: yarn dev");
    console.log("Depois: npm run phase1:check -- --smoke\n");
    process.exit(0);
  }
  lastClip = clip;

  if (Date.now() - started > timeoutMs) {
    clearInterval(timer);
    console.error("\n⏱️  Tempo esgotado. Copie a service_role e rode de novo:");
    console.error("   npm run setup:service-role\n");
    process.exit(1);
  }

  process.stdout.write(".");
}, 1500);
