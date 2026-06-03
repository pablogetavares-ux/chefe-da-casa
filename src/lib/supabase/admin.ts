import { createClient } from "@supabase/supabase-js";

import { env, publicEnv } from "@/config/env";
import type { Database } from "@/types/database";

/** Cliente com service role — apenas server-side (webhooks, jobs). */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }

  return createClient<Database>(
    publicEnv.supabaseUrl,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export function isAdminClientConfigured() {
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}
