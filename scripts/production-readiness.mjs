#!/usr/bin/env node
/**
 * Checklist de produção — env local + health/status remoto (opcional).
 * Uso: npm run production:check
 *      NEXT_PUBLIC_APP_URL=https://seu-dominio.com npm run production:check
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

console.log("=== Produção — Chef da Casa AI ===\n");

const deployCheck = spawnSync(
  "node",
  ["scripts/check-deploy-env.mjs", "--production"],
  { cwd: root, stdio: "inherit", env: { ...process.env, ...fileEnv } },
);

if (deployCheck.status !== 0) {
  process.exit(deployCheck.status ?? 1);
}

const baseUrl = get("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");

if (!baseUrl || baseUrl.includes("localhost")) {
  console.log(
    "\nℹ️  Pule health remoto: defina NEXT_PUBLIC_APP_URL com domínio de produção.\n",
  );
  process.exit(0);
}

async function fetchJson(path) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

console.log(`\n--- Health remoto: ${baseUrl} ---\n`);

try {
  const health = await fetchJson("/api/health");
  console.log(`GET /api/health → ${health.status}`);
  console.log(JSON.stringify(health.body, null, 2));

  if (
    health.body.readyForProduction === false &&
    health.body.blockers?.length
  ) {
    console.log("\n❌ Produção não pronta:");
    health.body.blockers.forEach((b) => console.log(`  - ${b}`));
    process.exit(1);
  }

  const status = await fetchJson("/api/v1/status");
  console.log(`\nGET /api/v1/status → ${status.status}`);
  console.log(JSON.stringify(status.body?.data ?? status.body, null, 2));

  console.log("\n✅ Checklist de produção concluído.\n");
} catch (error) {
  console.error("\n❌ Falha ao consultar health remoto:", error.message);
  console.log(
    "Deploy ainda não publicado ou URL incorreta. Após deploy, rode novamente.\n",
  );
  process.exit(1);
}
