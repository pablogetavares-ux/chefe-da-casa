#!/usr/bin/env node
/**
 * Fase 1 — checklist de base (env, disco, Supabase remoto, smoke opcional).
 * Uso: node scripts/phase1-check.mjs
 *      node scripts/phase1-check.mjs --smoke
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const runSmoke = process.argv.includes("--smoke");
const PROJECT_REF = "mnevlegpkrncxlqkqdnl";

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

const errors = [];
const warnings = [];
const ok = [];

function pass(msg) {
  ok.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}
function fail(msg) {
  errors.push(msg);
}

// --- Disco (Windows: C:) ---
try {
  const { execSync } = await import("node:child_process");
  const out = execSync(
    "wmic logicaldisk where \"DeviceID='C:'\" get FreeSpace /value",
    {
      encoding: "utf8",
    },
  );
  const free = Number(out.match(/FreeSpace=(\d+)/)?.[1] ?? 0);
  const freeGb = free / 1024 ** 3;
  if (freeGb < 2) {
    fail(
      `Disco C: crítico — ${freeGb.toFixed(1)} GB livres (risco de corrupção de arquivos)`,
    );
  } else if (freeGb < 5) {
    warn(
      `Disco C: baixo — ${freeGb.toFixed(1)} GB livres (recomendado ≥ 5 GB)`,
    );
  } else {
    pass(`Disco C: ${freeGb.toFixed(1)} GB livres`);
  }
} catch {
  warn("Não foi possível medir espaço em disco");
}

// --- Env obrigatória Fase 1 ---
for (const key of [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]) {
  if (get(key)) pass(`${key} configurada`);
  else fail(`${key} ausente`);
}

if (get("SUPABASE_SERVICE_ROLE_KEY").length > 20) {
  pass("SUPABASE_SERVICE_ROLE_KEY configurada");
} else {
  fail(
    "SUPABASE_SERVICE_ROLE_KEY ausente — rotas de IA não funcionam após migration security_audit_tables",
  );
  console.log(
    `\n  → Obtenha em: https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api\n     (secret "service_role" — nunca commitar)\n`,
  );
}

if (get("ADMIN_EMAILS")) {
  pass("ADMIN_EMAILS configurado");
} else {
  warn("ADMIN_EMAILS ausente — admin bloqueado em produção");
}

if (get("AI_DEV_MOCK") === "true" && !get("OPENAI_API_KEY")) {
  pass("IA em modo mock (OK para dev local)");
} else if (get("OPENAI_API_KEY")) {
  pass("OPENAI_API_KEY configurada");
} else {
  warn("OPENAI_API_KEY vazia e AI_DEV_MOCK não é true");
}

// --- Migration local ---
const migrationPath = resolve(
  root,
  "supabase/migrations/20260524130000_security_audit_tables.sql",
);
if (existsSync(migrationPath)) {
  pass("Migration security_audit_tables presente no repo");
} else {
  fail("Migration 20260524130000_security_audit_tables.sql não encontrada");
}

// --- Supabase remoto (políticas audit) ---
try {
  const url = get("NEXT_PUBLIC_SUPABASE_URL");
  const key = get("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (url && key) {
    const res = await fetch(`${url}/rest/v1/rpc/version`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    }).catch(() => null);
    if (res?.ok || res?.status === 404) {
      pass("Supabase URL acessível");
    } else {
      warn(`Supabase respondeu ${res?.status ?? "sem resposta"}`);
    }
  }
} catch {
  warn("Não foi possível pingar Supabase");
}

console.log("\n=== Fase 1 — Checklist Chef da Casa AI ===\n");

if (ok.length) {
  console.log("✅ OK:");
  ok.forEach((m) => console.log(`  • ${m}`));
}

if (warnings.length) {
  console.log("\n⚠️  Avisos:");
  warnings.forEach((m) => console.log(`  • ${m}`));
}

if (errors.length) {
  console.log("\n❌ Bloqueadores:");
  errors.forEach((m) => console.log(`  • ${m}`));
}

console.log("\n--- Supabase Dashboard (manual) ---");
console.log(
  `• Leaked Password Protection: https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers`,
);
console.log("  Auth → Providers → Email → Enable leaked password protection");
console.log(
  `• Migrations aplicadas: https://supabase.com/dashboard/project/${PROJECT_REF}/database/migrations`,
);
console.log("  Confirmar: security_audit_tables (última versão)");

if (runSmoke && errors.length === 0) {
  console.log("\n--- Smoke test ---");
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync("node", ["scripts/smoke-test.mjs"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...fileEnv },
  });
  process.exit(result.status ?? 1);
}

if (errors.length) {
  console.log(
    "\nCorrija os bloqueadores e rode: npm run phase1:check -- --smoke\n",
  );
  process.exit(1);
}

console.log(
  "\n✅ Fase 1 env OK. Rode smoke: npm run phase1:check -- --smoke\n",
);
