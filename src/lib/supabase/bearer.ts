import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/config/env";
import type { Database } from "@/types/database";

export function createBearerClient(accessToken: string) {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}
