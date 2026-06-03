#!/usr/bin/env node
/**
 * Abre Database settings e grava DIRECT_URL no .env ao colar a connection string.
 *
 * Uso: node scripts/capture-database-url.mjs
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_REF = "mnevlegpkrncxlqkqdnl";
const envPath = resolve(import.meta.dirname, "..", ".env");
const DASHBOARD_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`;

function readClipboard() {
  try {
    return execSync('powershell -NoProfile -Command "Get-Clipboard -Raw"', {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function isPostgresUrl(value) {
  return /^postgres(ql)?:\/\//i.test(value.trim());
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

console.log("\n🗄️  Chef da Casa AI — connection string (Direct)\n");
console.log("1. O navegador abre em Settings → Database");
console.log("2. Connection string → URI → modo **Direct** (porta 5432)");
console.log("3. Copie a URI completa (postgresql://...)");
console.log("4. Este script detecta no clipboard (até 3 min)\n");

openBrowser(DASHBOARD_URL);

const started = Date.now();
const timeoutMs = 3 * 60 * 1000;
let lastClip = "";

const timer = setInterval(() => {
  const clip = readClipboard();
  if (clip && clip !== lastClip && isPostgresUrl(clip)) {
    clearInterval(timer);
    const url = clip.trim().replace(/[?&]pgbouncer=true/gi, "");
    upsertEnv("DIRECT_URL", url);
    console.log("\n✅ DIRECT_URL gravada no .env");
    console.log("\nAplicando migration regional…\n");
    try {
      execSync(
        "node scripts/apply-supabase-sql.mjs supabase/migrations/20260530260000_regional_offers_geo_expansion.sql",
        { stdio: "inherit", cwd: resolve(import.meta.dirname, "..") },
      );
      execSync("node scripts/verify-offers-region.mjs", {
        stdio: "inherit",
        cwd: resolve(import.meta.dirname, ".."),
      });
    } catch {
      console.error("\nFalha ao aplicar. Rode: npm run db:fix:offers-region\n");
      process.exit(1);
    }
    process.exit(0);
  }
  lastClip = clip;

  if (Date.now() - started > timeoutMs) {
    clearInterval(timer);
    console.error("\n⏱️  Tempo esgotado. Cole a URI e rode de novo:");
    console.error("   npm run setup:database-url\n");
    process.exit(1);
  }

  process.stdout.write(".");
}, 1500);
