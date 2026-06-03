import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type OffersSchemaCapability = {
  /** profiles.offer_* — migration regional */
  profileRegion: boolean;
  /** regional_stores.latitude / longitude */
  storeGeo: boolean;
  /** regional_stores.is_active */
  storeActiveFlag: boolean;
};

let cached: OffersSchemaCapability | null = null;
let inflight: Promise<OffersSchemaCapability> | null = null;

function isMissingColumn(error: { code?: string; message?: string } | null) {
  return error?.code === "42703";
}

async function columnExists(
  supabase: Client,
  table: "profiles" | "regional_stores",
  column: string,
): Promise<boolean> {
  const { error } = await supabase.from(table).select(column).limit(1);
  return !isMissingColumn(error);
}

/**
 * Detecta se a migration `regional_offers_geo_expansion` foi aplicada.
 * Resultado em cache por processo (dev HMR reinicia o cache).
 */
async function probeOffersSchema(
  supabase: Client,
): Promise<OffersSchemaCapability> {
  const [profileRegion, storeGeo, storeActiveFlag] = await Promise.all([
    columnExists(supabase, "profiles", "offer_city"),
    columnExists(supabase, "regional_stores", "latitude"),
    columnExists(supabase, "regional_stores", "is_active"),
  ]);

  const result = { profileRegion, storeGeo, storeActiveFlag };

  if (profileRegion && storeGeo && storeActiveFlag) {
    cached = result;
  }

  return result;
}

export async function getOffersSchemaCapability(
  supabase: Client,
): Promise<OffersSchemaCapability> {
  if (cached) return cached;

  if (!inflight) {
    inflight = probeOffersSchema(supabase).finally(() => {
      inflight = null;
    });
  }

  return inflight;
}

/** Limpa cache (testes / após migration). */
export function resetOffersSchemaCapabilityCache() {
  cached = null;
  inflight = null;
}
