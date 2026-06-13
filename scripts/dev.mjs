/**
 * Entrada única: `npm run dev` (ou `yarn dev`).
 * OneDrive → sincroniza e sobe em C:\dev\chefe-da-casa.
 * C:\dev (ou outro disco local) → Next.js na pasta atual.
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");
const target = resolve(
  process.env.CHEFE_DEV_LOCAL_PATH ??
    process.env.CHEF_DEV_LOCAL_PATH ??
    "C:\\dev\\chefe-da-casa",
);

const onOneDrive = root.toLowerCase().includes("onedrive");
const inDevCopy =
  root.toLowerCase() === target.toLowerCase() ||
  process.env.CHEFE_DEV_IN_LOCAL === "1" ||
  process.env.CHEF_DEV_IN_LOCAL === "1";

if (onOneDrive && !inDevCopy) {
  console.log("\n→ Projeto no OneDrive: dev em C:\\dev\\chefe-da-casa\n");
  const localScript = resolve(__dirname, "dev-local.mjs");
  execSync(`node "${localScript}"`, { stdio: "inherit", cwd: root });
  process.exit(0);
}

execSync(`node "${resolve(__dirname, "prepare-dev.mjs")}"`, {
  stdio: "inherit",
  cwd: root,
});

const next = spawn("npx", ["next", "dev", "-p", "3000"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

next.on("exit", (code) => process.exit(code ?? 0));
