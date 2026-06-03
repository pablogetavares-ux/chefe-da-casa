/**
 * Prepara ambiente antes de `next dev`: libera portas e limpa cache .next corrompido.
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");
const ports = ["3000", "3001", "3002"];

function killPort(port) {
  const script = resolve(__dirname, "kill-port.mjs");
  try {
    execSync(`node "${script}" ${port}`, { cwd: root, stdio: "inherit" });
  } catch {
    // ignore
  }
}

function cleanNextCache() {
  const nextDir = resolve(root, ".next");
  if (!existsSync(nextDir)) return;

  try {
    rmSync(nextDir, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 300,
    });
    console.log("Cache .next removido.");
  } catch (error) {
    console.warn(
      "Aviso: não foi possível limpar .next completamente:",
      error instanceof Error ? error.message : error,
    );
  }
}

console.log("\n🔧 Preparando dev server...\n");

for (const port of ports) {
  killPort(port);
}

const onOneDrive = root.toLowerCase().includes("onedrive");
if (onOneDrive) {
  console.log("Pasta no OneDrive — limpando .next...\n");
  cleanNextCache();
}

console.log("Pronto. Iniciando Next.js...\n");
