#!/usr/bin/env node
/**
 * Grava SUPABASE_ACCESS_TOKEN (PAT) para Management API / supabase db query --linked
 * https://supabase.com/dashboard/account/tokens
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(import.meta.dirname, "..", ".env");
const DASHBOARD_URL = "https://supabase.com/dashboard/account/tokens";

function readClipboard() {
  try {
    return execSync('powershell -NoProfile -Command "Get-Clipboard -Raw"', {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

function isPat(value) {
  return /^sbp_[a-zA-Z0-9]+$/.test(value.trim());
}

function upsertEnv(key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  content = re.test(content)
    ? content.replace(re, `${key}=${value}`)
    : `${content.trimEnd()}\n${key}=${value}\n`;
  writeFileSync(envPath, content, "utf8");
}

spawn("cmd", ["/c", "start", "", DASHBOARD_URL], {
  detached: true,
  stdio: "ignore",
}).unref();

console.log("\n🔐 Cole o Personal Access Token (sbp_...) no clipboard\n");

const started = Date.now();
const timer = setInterval(() => {
  const clip = readClipboard();
  if (isPat(clip)) {
    clearInterval(timer);
    upsertEnv("SUPABASE_ACCESS_TOKEN", clip.trim());
    console.log(
      "✅ SUPABASE_ACCESS_TOKEN gravado. Rode: npm run db:fix:offers-region\n",
    );
    process.exit(0);
  }
  if (Date.now() - started > 180_000) {
    clearInterval(timer);
    process.exit(1);
  }
  process.stdout.write(".");
}, 1500);
