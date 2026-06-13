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
  /** offer_verticals + offer_categories — Central Multi-Ofertas */
  offerCatalog: boolean;
  /** índices de busca em regional_offers (pg_trgm) */
  offerSearchIndexes: boolean;
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

async function tableExists(
  supabase: Client,
  table: "offer_verticals",
): Promise<boolean> {
  const { error } = await supabase.from(table).select("id").limit(1);
  return error?.code !== "42P01";
}

/**
 * Detecta se a migration `regional_offers_geo_expansion` foi aplicada.
 * Resultado em cache por processo (dev HMR reinicia o cache).
 */
async function probeOffersSchema(
  supabase: Client,
): Promise<OffersSchemaCapability> {
  const [profileRegion, storeGeo, storeActiveFlag, offerCatalog] =
    await Promise.all([
      columnExists(supabase, "profiles", "offer_city"),
      columnExists(supabase, "regional_stores", "latitude"),
      columnExists(supabase, "regional_stores", "is_active"),
      tableExists(supabase, "offer_verticals"),
    ]);

  const result = {
    profileRegion,
    storeGeo,
    storeActiveFlag,
    offerCatalog,
    offerSearchIndexes: offerCatalog,
  };

  if (profileRegion && storeGeo && storeActiveFlag && offerCatalog) {
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
