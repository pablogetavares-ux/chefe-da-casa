import { createBearerClient, getBearerToken } from "@/lib/supabase/bearer";
import { createClient } from "@/lib/supabase/server";

export async function getAuthUser(request?: Request) {
  const bearer = request ? getBearerToken(request) : null;

  if (bearer) {
    const supabase = createBearerClient(bearer);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  }

  const supabase = await createClient();
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
  const bearer = request ? getBearerToken(request) : null;
  if (bearer) return createBearerClient(bearer);
  return createClient();
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}
