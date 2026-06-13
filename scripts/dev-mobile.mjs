/**
 * Dev acessível no celular (mesma Wi‑Fi).
 * Uso: npm run dev:mobile
 */
import { execSync, spawn } from "node:child_process";
import os from "node:os";

const port = process.env.PORT ?? "3000";

function getLanIp() {
  for (const interfaces of Object.values(os.networkInterfaces())) {
    if (!interfaces) continue;
    for (const iface of interfaces) {
      if (iface.family !== "IPv4" || iface.internal) continue;
      if (iface.address.startsWith("169.254.")) continue;
      return iface.address;
    }
  }
  return "127.0.0.1";
}

const ip = getLanIp();
const appUrl = `http://${ip}:${port}`;

console.log("\n📱 Chefe da Casa — dev mobile\n");
console.log(`   No Chrome do Android, abra:\n`);
console.log(`   → ${appUrl}/login`);
console.log(`   → ${appUrl}/app\n`);
console.log("   Requisitos: mesma Wi‑Fi, use http (não https).\n");
console.log(`   NEXT_PUBLIC_APP_URL=${appUrl}\n`);

if (process.platform === "win32") {
  try {
    execSync(
      `netsh advfirewall firewall add rule name="Chefe da Casa Dev ${port}" dir=in action=allow protocol=TCP localport=${port}`,
      { stdio: "ignore" },
    );
    console.log("   ✓ Regra de firewall adicionada (porta liberada).\n");
  } catch {
    console.log(
      "   ⚠ Não foi possível abrir firewall automaticamente — execute como Administrador se o celular não conectar.\n",
    );
  }
}

const child = spawn("npx", ["next", "dev", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_URL: appUrl,
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
