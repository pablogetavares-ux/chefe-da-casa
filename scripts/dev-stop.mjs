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

const pid = readPid();

if (pid) {
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGTERM");
    }
    console.log(`Servidor encerrado (PID ${pid}).`);
  } catch {
    console.log("Processo do servidor já não estava ativo.");
  }
} else {
  console.log("Nenhum PID registrado — liberando porta...");
}

fs.rmSync(pidFile, { force: true });

execSync(`node "${path.join(__dirname, "kill-port.mjs")}" ${port}`, {
  cwd: root,
  stdio: "inherit",
});
