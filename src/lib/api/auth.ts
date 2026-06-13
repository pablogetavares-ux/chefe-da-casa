import { headers } from "next/headers";

import { createBearerClient, getBearerToken } from "@/lib/supabase/bearer";
import { createClient } from "@/lib/supabase/server";

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

export async function getAuthUser(request?: Request) {
  const bearer = await resolveBearerToken(request);

  if (bearer) {
    const supabase = createBearerClient(bearer);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  }

  const supabase = await createClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAuthUser(request?: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function createAuthClient(request?: Request) {
  return createClient(request);
}

/** Usuário autenticado + client Supabase (cookie ou Bearer). */
export async function requireAuthenticatedClient(request?: Request) {
  const user = await requireAuthUser(request);
  const supabase = await createClient(request);
  return { user, supabase };
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}
