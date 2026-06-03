import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = process.argv[2] ?? process.env.PORT ?? "3000";
const pidFile = path.join(root, ".dev-server.pid");

function readPid() {
  try {
    const raw = fs.readFileSync(pidFile, "utf8").trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function isPortInUse() {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr ":${port}"`, {
        encoding: "utf8",
      });
      return output.includes("LISTENING");
    }

    execSync(`lsof -ti tcp:${port}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const pid = readPid();
const portOpen = isPortInUse();
const pidAlive = pid ? isProcessAlive(pid) : false;

if (portOpen && pidAlive) {
  console.log(`Rodando — http://localhost:${port} (PID ${pid})`);
  process.exit(0);
}

if (portOpen) {
  console.log(
    `Porta ${port} em uso, mas PID ${pid ?? "desconhecido"} não registrado.`,
  );
  process.exit(0);
}

console.log(`Parado — nada escutando na porta ${port}.`);
console.log(`Iniciar: yarn dev`);
process.exit(1);
