import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = process.env.PORT ?? "3000";
const pidFile = path.join(root, ".dev-server.pid");
const logFile = path.join(root, ".dev-server.log");

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

function getListeningPid() {
  try {
    if (process.platform === "win32") {
      const output = execSync(`netstat -ano | findstr ":${port}"`, {
        encoding: "utf8",
      });

      for (const line of output.split("\n")) {
        if (!line.includes("LISTENING")) continue;
        const pid = line.trim().split(/\s+/).at(-1);
        if (pid && pid !== "0") {
          return Number.parseInt(pid, 10);
        }
      }
      return null;
    }

    const pid = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" }).trim();
    return pid ? Number.parseInt(pid.split("\n")[0], 10) : null;
  } catch {
    return null;
  }
}

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

function stopExisting() {
  const pid = readPid();
  if (pid && isProcessAlive(pid)) {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
      } else {
        process.kill(pid, "SIGTERM");
      }
    } catch {
      // Processo já encerrado.
    }
  }

  fs.rmSync(pidFile, { force: true });
  execSync(`node "${path.join(__dirname, "kill-port.mjs")}" ${port}`, {
    cwd: root,
    stdio: "ignore",
  });
}

function appendLogHeader() {
  fs.appendFileSync(
    logFile,
    `\n--- dev server ${new Date().toISOString()} ---\n`,
  );
}

/**
 * Windows: cmd start /B + webpack evita a janela preta "next-server" do Turbopack.
 */
async function startDetachedWindows() {
  const nextBin = path.join(
    root,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  appendLogHeader();

  const command = `start /B node "${nextBin}" dev -p ${port} --webpack 1>> "${logFile}" 2>&1`;

  execSync(`cmd /c ${command}`, {
    cwd: root,
    stdio: "ignore",
    windowsHide: true,
  });

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const pid = getListeningPid();
    if (pid) {
      fs.writeFileSync(pidFile, String(pid));
      return pid;
    }
    await sleep(500);
  }

  throw new Error(
    "Servidor não respondeu a tempo. Veja .dev-server.log para detalhes.",
  );
}

function startDetachedUnix() {
  const nextBin = path.join(
    root,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  appendLogHeader();

  const logFd = fs.openSync(logFile, "a");
  const child = spawn(process.execPath, [nextBin, "dev", "-p", port], {
    cwd: root,
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env: { ...process.env, PORT: port },
  });

  child.unref();
  fs.closeSync(logFd);
  fs.writeFileSync(pidFile, String(child.pid));

  return child.pid;
}

async function startDetached() {
  if (process.platform === "win32") {
    return startDetachedWindows();
  }
  return startDetachedUnix();
}

if (isPortInUse()) {
  const pid = readPid();
  if (pid && isProcessAlive(pid)) {
    console.log(
      `Servidor já está rodando em http://localhost:${port} (PID ${pid}).`,
    );
    console.log(`Parar: yarn dev:stop`);
    process.exit(0);
  }

  console.log(`Porta ${port} ocupada por outro processo. Reiniciando...`);
  stopExisting();
} else {
  fs.rmSync(pidFile, { force: true });
}

const pid = await startDetached();

console.log("");
console.log("Servidor em background (sem janela extra no Windows).");
console.log(`  URL:  http://localhost:${port}`);
console.log(`  PID:  ${pid}`);
console.log(`  Logs: .dev-server.log`);
console.log(`  Parar: yarn dev:stop`);
console.log("");
