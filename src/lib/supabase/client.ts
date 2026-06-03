import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/config/public-env";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  );
}
