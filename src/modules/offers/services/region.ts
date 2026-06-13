import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildRegionConfigResponse,
  buildUserOfferRegion,
  regionFromProfile,
  type ProfileRegionRow,
} from "@/modules/offers/region/user-region";
import { getOffersSchemaCapability } from "@/modules/offers/region/schema-capability";
import type {
  OfferRegionCityOption,
  OfferRegionConfigResponse,
  RegionalStoreGeo,
  UserOfferRegion,
} from "@/modules/offers/region/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const PROFILE_REGION_SELECT =
  "offer_city, offer_state, offer_search_radius_km" as const;

export async function getUserOfferRegion(
  supabase: Client,
  userId: string,
): Promise<UserOfferRegion> {
  const cap = await getOffersSchemaCapability(supabase);
  if (!cap.profileRegion) {
    return regionFromProfile(null);
  }

  const { data } = await supabase
    .from("profiles")
    .select(PROFILE_REGION_SELECT)
    .eq("id", userId)
    .single();

  return regionFromProfile(data as ProfileRegionRow | null);
}

export async function saveUserOfferRegion(
  supabase: Client,
  userId: string,
  input: {
    city: string;
    state: string;
    radiusKm: number;
  },
): Promise<OfferRegionConfigResponse> {
  const region = buildUserOfferRegion(input);
  const cap = await getOffersSchemaCapability(supabase);

  if (cap.profileRegion) {
    const { error } = await supabase
      .from("profiles")
      .update({
        offer_city: region.city,
        offer_state: region.state,
        offer_search_radius_km: region.radiusKm,
      })
      .eq("id", userId);

    if (error) throw error;
  }

  return buildRegionConfigResponse(region);
}

export async function getOfferRegionConfig(
  supabase: Client,
  userId: string,
): Promise<OfferRegionConfigResponse> {
  const region = await getUserOfferRegion(supabase, userId);
  return buildRegionConfigResponse(region);
}

export async function fetchActiveRegionalStores(
  supabase: Client,
  options?: { verticalId?: string | null },
): Promise<RegionalStoreGeo[]> {
  const cap = await getOffersSchemaCapability(supabase);

  if (cap.storeGeo) {
    let query = supabase
      .from("regional_stores")
      .select(
        "id, name, chain, city, state, neighborhood, latitude, longitude, is_active",
      )
      .order("city");

    if (options?.verticalId) {
      query = query.eq("vertical_id", options.verticalId);
    }

    if (cap.storeActiveFlag) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      chain: row.chain,
      city: row.city,
      state: row.state,
      neighborhood: row.neighborhood,
      latitude: row.latitude,
      longitude: row.longitude,
      is_active: row.is_active ?? true,
    }));
  }

  let legacyQuery = supabase
    .from("regional_stores")
    .select("id, name, chain, city, state, neighborhood")
    .order("city");

  if (options?.verticalId) {
    legacyQuery = legacyQuery.eq("vertical_id", options.verticalId);
  }

  if (cap.storeActiveFlag) {
    legacyQuery = legacyQuery.eq("is_active", true);
  }

  const { data, error } = await legacyQuery;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    chain: row.chain,
    city: row.city,
    state: row.state,
    neighborhood: row.neighborhood,
    latitude: null,
    longitude: null,
    is_active: true,
  }));
}

export type OfferStoreCatalog = {
  stores: RegionalStoreGeo[];
  cities: string[];
  regionCities: OfferRegionCityOption[];
};

function buildRegionCitiesFromStores(
  stores: RegionalStoreGeo[],
): OfferRegionCityOption[] {
  const seen = new Set<string>();
  const options: OfferRegionCityOption[] = [];

  for (const store of stores) {
    const key = `${store.city}|${store.state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      city: store.city,
      state: store.state,
      label: `${store.city} — ${store.state}`,
    });
  }

  return options;
}

/** Uma query em `regional_stores` — reutilize em rotas que precisam de cidades + lojas. */
export async function fetchOfferStoreCatalog(
  supabase: Client,
  options?: { verticalId?: string | null },
): Promise<OfferStoreCatalog> {
  const stores = await fetchActiveRegionalStores(supabase, options);

  return {
    stores,
    cities: [...new Set(stores.map((store) => store.city))],
    regionCities: buildRegionCitiesFromStores(stores),
  };
}

export async function fetchOfferRegionCities(
  supabase: Client,
): Promise<OfferRegionCityOption[]> {
  const { regionCities } = await fetchOfferStoreCatalog(supabase);
  return regionCities;
}
