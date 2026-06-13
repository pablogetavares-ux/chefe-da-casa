import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

import { publicEnv } from "@/config/env";
import type { Database } from "@/types/database";

import { createBearerClient, getBearerToken } from "./bearer";

async function resolveBearerToken(request?: Request) {
  if (request) {
    const fromRequest = getBearerToken(request);
    if (fromRequest) return fromRequest;
  }

  try {
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim() || null;
    }
  } catch {
    /* fora de request context */
  }

  return null;
}

export async function createClient(request?: Request) {
  const bearer = await resolveBearerToken(request);
  if (bearer) return createBearerClient(bearer);

  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll é chamado de Server Components — ignorar em render estático
          }
        },
      },
    },
  );
}
