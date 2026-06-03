/**
 * Aplica SQL no Postgres remoto (migrations pontuais).
 *
 * Ordem de conexão:
 * 1. DIRECT_URL ou DATABASE_URL no .env
 * 2. SUPABASE_DB_PASSWORD (monta URI direct db.{ref}.supabase.co)
 * 3. SUPABASE_ACCESS_TOKEN → Management API (query)
 *
 * Uso:
 *   node scripts/apply-supabase-sql.mjs supabase/migrations/20260530260000_regional_offers_geo_expansion.sql
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import { config } from "dotenv";

const PROJECT_REF = "mnevlegpkrncxlqkqdnl";
const API_BASE = "https://api.supabase.com/v1";

config();

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Uso: node scripts/apply-supabase-sql.mjs <arquivo.sql>");
  process.exit(1);
}

const sql = readFileSync(resolve(sqlPath), "utf8");

function buildUrlFromPassword(password) {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres:${encoded}@db.${PROJECT_REF}.supabase.co:5432/postgres`;
}

function resolveDbUrl() {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) return direct;
  const pooled = process.env.DATABASE_URL?.trim();
  if (pooled && !pooled.includes("pgbouncer=true")) return pooled;
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (password) return buildUrlFromPassword(password);
  return null;
}

async function runViaPg(dbUrl) {
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("✓ SQL aplicado via Postgres (pg)");
  } finally {
    await client.end();
  }
}

async function runViaManagementApi(token) {
  const res = await fetch(
    `${API_BASE}/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Management API ${res.status}: ${body.slice(0, 500)}`);
  }
  console.log("✓ SQL aplicado via Supabase Management API");
}

async function main() {
  const dbUrl = resolveDbUrl();
  if (dbUrl) {
    await runViaPg(dbUrl);
    return;
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (token) {
    await runViaManagementApi(token);
    return;
  }

  console.error(`✗ Sem credenciais de banco.

Defina UMA opção no .env (não commitar senhas):

  DIRECT_URL=postgresql://postgres:****@db.${PROJECT_REF}.supabase.co:5432/postgres

ou

  SUPABASE_DB_PASSWORD=****

ou (token pessoal: https://supabase.com/dashboard/account/tokens)

  SUPABASE_ACCESS_TOKEN=sbp_****

Depois rode novamente:

  node scripts/apply-supabase-sql.mjs ${sqlPath}
`);
  process.exit(1);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
