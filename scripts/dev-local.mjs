/**
 * Sincroniza o repo e inicia o dev server em C:\dev\chefe-da-casa.
 * Chamado por `npm run dev` quando o projeto está no OneDrive.
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const target =
  process.env.CHEFE_DEV_LOCAL_PATH ??
  process.env.CHEF_DEV_LOCAL_PATH ??
  "C:\\dev\\chefe-da-casa";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const syncScript = resolve(__dirname, "sync-to-dev.mjs");

execSync(`node "${syncScript}"`, { stdio: "inherit" });

if (!existsSync(resolve(target, "node_modules"))) {
  console.log("\n→ Instalando dependências em C:\\dev...\n");
  execSync("npm install", { cwd: target, stdio: "inherit" });
}

console.log("\n→ Liberando porta 3000...\n");
try {
  execSync("npm run dev:stop", { cwd: target, stdio: "inherit" });
} catch {
  // ignore
}

console.log(`\n→ Iniciando dev em ${target}\n`);
console.log("   App:   http://localhost:3000");
console.log("   Admin: http://localhost:3000/app/admin\n");

const child = spawn("npm", ["run", "dev:here"], {
  cwd: target,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    CHEFE_DEV_IN_LOCAL: "1",
    CHEF_DEV_IN_LOCAL: "1",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
