import { execSync } from "node:child_process";
import { existsSync, lstatSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const nextDir = resolve(root, ".next");
const legacyLocalNextPaths = [
  resolve(process.env.LOCALAPPDATA ?? "", "chefe-da-casa-ia", ".next"),
  resolve(process.env.LOCALAPPDATA ?? "", "chef-da-casa-ia", ".next"),
];

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function isDirectoryLink(path) {
  if (!existsSync(path)) {
    return false;
  }

  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

function removePath(path) {
  if (!existsSync(path)) {
    return;
  }

  if (isDirectoryLink(path)) {
    if (process.platform === "win32") {
      execSync(`cmd /c rmdir "${path}"`, { stdio: "ignore" });
      return;
    }

    rmSync(path, { force: true });
    return;
  }

  rmSync(path, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 200,
  });
}

async function removeNextCache() {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      removePath(nextDir);
      for (const legacyLocalNext of legacyLocalNextPaths) {
        removePath(legacyLocalNext);
      }
      console.log("Cache .next removido.");
      return;
    } catch (error) {
      if (attempt === 5) {
        console.warn(
          "Não foi possível remover .next (feche yarn dev e tente de novo):",
          error instanceof Error ? error.message : error,
        );
        process.exitCode = 1;
        return;
      }
      await sleep(500 * attempt);
    }
  }
}

await removeNextCache();
