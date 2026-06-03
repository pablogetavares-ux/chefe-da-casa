import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "✗ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY necessários",
  );
  process.exit(1);
}

const supabase = createClient(url, key);

const checks = [
  () => supabase.from("profiles").select("offer_city").limit(1),
  () =>
    supabase
      .from("regional_stores")
      .select("latitude, longitude, is_active")
      .limit(1),
  () => supabase.from("offer_market_catalog").select("id").limit(1),
];

let ok = true;
for (const run of checks) {
  const { error } = await run();
  if (error) {
    console.error("✗", error.message);
    ok = false;
  }
}

if (ok) {
  console.log("✓ Schema regional de ofertas OK no Supabase remoto");
  process.exit(0);
}

process.exit(1);
