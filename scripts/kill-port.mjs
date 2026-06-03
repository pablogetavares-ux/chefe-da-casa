import { execSync } from "node:child_process";

const port = process.argv[2] ?? "3000";

function killOnWindows() {
  try {
    const output = execSync(`netstat -ano | findstr ":${port}"`, {
      encoding: "utf8",
    });

    const pids = new Set();
    for (const line of output.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const pid = line.trim().split(/\s+/).at(-1);
      if (pid && pid !== "0") pids.add(pid);
    }

    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Porta ${port} liberada (PID ${pid}).`);
    }
  } catch {
    // Nenhum processo na porta.
  }
}

function killOnUnix() {
  try {
    const pid = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" }).trim();
    if (!pid) return;

    for (const id of pid.split("\n")) {
      execSync(`kill -9 ${id}`, { stdio: "ignore" });
      console.log(`Porta ${port} liberada (PID ${id}).`);
    }
  } catch {
    // Nenhum processo na porta.
  }
}

if (process.platform === "win32") {
  killOnWindows();
} else {
  killOnUnix();
}
