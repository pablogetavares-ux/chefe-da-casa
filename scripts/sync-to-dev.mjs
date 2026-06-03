/**
 * Espelha o código atual em C:\dev\chef-da-casa (fora do OneDrive).
 * Uso: npm run sync:dev
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const source = resolve(__dirname, "..");
const target = process.env.CHEF_DEV_LOCAL_PATH ?? "C:\\dev\\chef-da-casa";

if (!existsSync("C:\\dev")) {
  mkdirSync("C:\\dev", { recursive: true });
}

console.log(`\n→ Sincronizando para ${target}\n`);

const cmd = [
  "robocopy",
  `"${source}"`,
  `"${target}"`,
  "/MIR",
  "/XD",
  "node_modules",
  ".next",
  "/R:2",
  "/W:2",
  "/NFL",
  "/NDL",
  "/NJH",
  "/NJS",
].join(" ");

try {
  execSync(cmd, { stdio: "inherit", shell: true });
} catch (error) {
  const code = error?.status ?? 1;
  if (code >= 8) process.exit(code);
}

console.log("\n✓ Sincronização concluída.\n");
