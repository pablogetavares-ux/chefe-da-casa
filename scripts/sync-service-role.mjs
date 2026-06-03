#!/usr/bin/env node
/**
 * Busca SUPABASE_SERVICE_ROLE_KEY via Supabase CLI e grava no .env
 * Pré-requisito: npx supabase login (uma vez)
 *
 * Uso: node scripts/sync-service-role.mjs
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_REF = "mnevlegpkrncxlqkqdnl";
const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

function getApiKeys() {
  const out = execSync(
    `npx supabase projects api-keys --project-ref ${PROJECT_REF} -o json`,
    { encoding: "utf8", cwd: root, stdio: ["pipe", "pipe", "pipe"] },
  );
  return JSON.parse(out);
}

function upsertEnv(key, value) {
  if (!existsSync(envPath)) {
    writeFileSync(envPath, `${key}=${value}\n`, "utf8");
    return;
  }
  let content = readFileSync(envPath, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}\n`;
  }
  writeFileSync(envPath, content, "utf8");
}

console.log("Chef da Casa AI — sync service role\n");

try {
  const keys = getApiKeys();
  const serviceRole =
    keys.find((k) => k.name === "service_role")?.api_key ??
    keys.find((k) => k.type === "secret")?.api_key;

  if (!serviceRole) {
    console.error("service_role não encontrada. Chaves disponíveis:");
    console.error(keys.map((k) => `- ${k.name} (${k.type})`).join("\n"));
    process.exit(1);
  }

  upsertEnv("SUPABASE_SERVICE_ROLE_KEY", serviceRole);
  console.log("✅ SUPABASE_SERVICE_ROLE_KEY gravada no .env");
  console.log("\nReinicie o dev server: yarn dev");
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("Access token not provided") ||
    msg.includes("not logged in")
  ) {
    console.log("Supabase CLI não autenticado. Abrindo login...\n");
    const login = spawnSync("npx", ["supabase", "login"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    if (login.status !== 0) {
      console.error("\nLogin cancelado ou falhou.");
      console.error(
        "Manual: https://supabase.com/dashboard/project/" +
          PROJECT_REF +
          "/settings/api",
      );
      process.exit(1);
    }
    console.log("\nLogin OK — tentando novamente...\n");
    const keys = getApiKeys();
    const serviceRole = keys.find((k) => k.name === "service_role")?.api_key;
    if (!serviceRole) {
      console.error("service_role não encontrada após login.");
      process.exit(1);
    }
    upsertEnv("SUPABASE_SERVICE_ROLE_KEY", serviceRole);
    console.log("✅ SUPABASE_SERVICE_ROLE_KEY gravada no .env");
  } else {
    console.error("Erro:", msg);
    process.exit(1);
  }
}
