/**
 * Aplica migrations em supabase/migrations no projeto remoto.
 * Usa DIRECT_URL, DATABASE_URL ou SUPABASE_ACCESS_TOKEN (CLI/Management API).
 */
import { execSync } from "node:child_process";
import { config } from "dotenv";

config();

const dbUrl =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();

if (!dbUrl && !accessToken) {
  console.error(`✗ Credenciais ausentes.

  Opção A: npm run setup:database-url  (cola DIRECT_URL)
  Opção B: npm run setup:access-token   (cola sbp_... do dashboard)
  Opção C: npx supabase login`);
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const flags = ["db", "push", "--yes"];
if (dbUrl) flags.push(`--db-url=${dbUrl}`);
if (dryRun) flags.push("--dry-run");

console.log(dryRun ? "Dry-run migrations…" : "Aplicando migrations…");

try {
  execSync(`npx supabase ${flags.join(" ")}`, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...(accessToken ? { SUPABASE_ACCESS_TOKEN: accessToken } : {}),
    },
  });
  console.log(dryRun ? "✓ Dry-run concluído" : "✓ Migrations aplicadas");
} catch {
  process.exit(1);
}
