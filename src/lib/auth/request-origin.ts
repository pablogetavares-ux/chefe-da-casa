import { headers } from "next/headers";

import { siteConfig } from "@/config/site";

function isPrivateHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)
  );
}

function normalizeOrigin(value: string) {
  return value.replace(/\/$/, "");
}

/** Origem real da requisição — funciona com IP local, túnel ou domínio. */
export async function getRequestOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return normalizeOrigin(siteConfig.url);

    const hostname = host.split(":")[0] ?? host;
    const proto = isPrivateHost(hostname)
      ? "http"
      : (h.get("x-forwarded-proto") ?? "https");

    return normalizeOrigin(`${proto}://${host}`);
  } catch {
    return normalizeOrigin(siteConfig.url);
  }
}

export function buildAuthCallbackUrl(origin: string, next: string) {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
