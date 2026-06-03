/**
 * Sincroniza tipos do Supabase.
 * Requer Supabase CLI autenticada: npx supabase login
 *
 * Alternativa: use MCP Supabase → generate_typescript_types
 * e copie o output para src/types/database.ts
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DATABASE_TYPE_EXPORTS } from "./database-type-exports.mjs";

const PROJECT_ID = "mnevlegpkrncxlqkqdnl";
const OUTPUT = resolve("src/types/database.ts");

try {
  const types = execSync(
    `npx supabase gen types typescript --project-id ${PROJECT_ID}`,
    { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
  );

  writeFileSync(OUTPUT, types.trimEnd() + DATABASE_TYPE_EXPORTS);
  console.log(`✓ Tipos sincronizados em ${OUTPUT}`);
} catch {
  console.error(
    "✗ Falha CLI. Use MCP: generate_typescript_types → scripts/mcp-types.json → npm run db:types:mcp",
  );
  process.exit(1);
}
