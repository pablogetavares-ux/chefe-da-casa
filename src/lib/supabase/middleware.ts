import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/config/public-env";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import type { Database } from "@/types/database";

const API_MUTATION_LIMIT = 120;

function assertApiOrigin(request: NextRequest) {
  if (process.env.NODE_ENV === "development") return;

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/webhooks")) return;
  if (!pathname.startsWith("/api/")) return;

  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const origin = request.headers.get("origin");
  const authorization = request.headers.get("authorization");

  if (!origin) {
    if (authorization?.startsWith("Bearer ")) return;

    const secFetchSite = request.headers.get("sec-fetch-site");
    if (
      secFetchSite &&
      secFetchSite !== "same-origin" &&
      secFetchSite !== "same-site"
    ) {
      return NextResponse.json(
        { success: false, error: "Origem não permitida", code: "FORBIDDEN" },
        { status: 403 },
      );
    }
    return;
  }

  const allowed = new Set(
    [
      publicEnv.appUrl.replace(/\/$/, ""),
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean) as string[],
  );

  if (!allowed.has(origin.replace(/\/$/, ""))) {
    return NextResponse.json(
      { success: false, error: "Origem não permitida", code: "FORBIDDEN" },
      { status: 403 },
    );
  }
}

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];
const PROTECTED_PREFIXES = ["/app", "/compras-do-mes"];
const RECOVERY_ROUTE = "/reset-password";

/** Rotas de metadata/PWA — sem sessão nem redirect. */
const PUBLIC_ASSET_PREFIXES = [
  "/apple-icon",
  "/icon",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/robots.txt",
  "/sitemap.xml",
];

export async function updateSession(request: NextRequest) {
  const originBlock = assertApiOrigin(request);
  if (originBlock) return originBlock;

  const { pathname } = request.nextUrl;

  if (PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const method = request.method.toUpperCase();
  if (
    user &&
    pathname.startsWith("/api/v1") &&
    method !== "GET" &&
    method !== "HEAD" &&
    method !== "OPTIONS"
  ) {
    const rate = await checkRateLimit(`api:${user.id}`, API_MUTATION_LIMIT);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Muitas requisições. Aguarde e tente novamente.",
          code: "RATE_LIMIT",
        },
        {
          status: 429,
          headers: rate.retryAfterMs
            ? { "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)) }
            : undefined,
        },
      );
    }
  }

  if (
    !user &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!user && pathname.startsWith(RECOVERY_ROUTE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/forgot-password";
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = getSafeRedirectPath(
      request.nextUrl.searchParams.get("next"),
    );
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
