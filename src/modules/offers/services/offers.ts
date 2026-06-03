import type { SupabaseClient } from "@supabase/supabase-js";

import {
  filterStoreIdsByRegionScope,
  filterStoresByRegionScope,
  isSameCity,
} from "@/modules/offers/region";
import type {
  OfferRegionScope,
  RegionalStoreGeo,
  UserOfferRegion,
} from "@/modules/offers/region/types";
import {
  computeDiscountPercent,
  DEFAULT_OFFER_CITY,
  type OfferAlternateCity,
  type OfferCategory,
  type OfferMatchScope,
  type RegionalOffer,
} from "@/modules/offers/types";
import { resolveOfferImageSrc } from "@/modules/offers/constants/offer-images";
import {
  extractRecipeIngredientNames,
  extractRecipeIngredientTerms,
  getOfferMatchedIngredients,
  scoreOfferForRecipe,
} from "@/modules/offers/utils/matching";
import { getOffersSchemaCapability } from "@/modules/offers/region/schema-capability";
import {
  fetchActiveRegionalStores,
  fetchOfferStoreCatalog,
} from "@/modules/offers/services/region";
import type { Database, Recipe } from "@/types/database";

type Client = SupabaseClient<Database>;

const OFFER_SELECT = `
  *,
  store:regional_stores!regional_offers_store_id_fkey (*)
`;

type StoreRow = Database["public"]["Tables"]["regional_stores"]["Row"];

type OfferQueryRow = Database["public"]["Tables"]["regional_offers"]["Row"] & {
  store: StoreRow | null;
};

function isOfferWithStore(
  row: OfferQueryRow,
): row is OfferQueryRow & { store: StoreRow } {
  return row.store != null;
}

function offersWithStore(
  rows: OfferQueryRow[],
): (OfferQueryRow & { store: StoreRow })[] {
  return rows.filter(isOfferWithStore);
}

function isLocalToRegion(
  offer: RegionalOffer,
  region: UserOfferRegion,
): boolean {
  if (offer.regionScope === "national" || offer.regionScope === "same_city") {
    return true;
  }
  if (offer.regionScope === "nearby") return false;
  return isSameCity(
    offer.store.city,
    offer.store.state,
    region.city,
    region.state,
  );
}

function isNearbyToRegion(
  offer: RegionalOffer,
  region: UserOfferRegion,
): boolean {
  if (offer.regionScope === "national") return false;
  if (offer.regionScope === "nearby") return true;
  if (offer.regionScope === "same_city") return false;
  return !isSameCity(
    offer.store.city,
    offer.store.state,
    region.city,
    region.state,
  );
}

export function mapOfferRow(
  row: OfferQueryRow & { store: StoreRow },
  favoriteIds: Set<string>,
  meta?: { distanceKm?: number | null; regionScope?: OfferRegionScope | null },
): RegionalOffer {
  const discountPercent = computeDiscountPercent(
    row.current_price,
    row.previous_price,
  );

  return {
    ...row,
    store: row.store,
    isFavorite: favoriteIds.has(row.id),
    discountPercent,
    distanceKm: meta?.distanceKm ?? null,
    regionScope: meta?.regionScope ?? null,
    image_url: resolveOfferImageSrc(
      row.image_url,
      row.product_name,
      row.ingredient_keywords,
      row.description ?? "",
      row.title,
    ),
  };
}

export async function fetchUserFavoriteOfferIds(
  supabase: Client,
  userId: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from("offer_favorites")
    .select("offer_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((row) => row.offer_id));
}

export async function fetchOfferCities(supabase: Client): Promise<string[]> {
  const catalog = await fetchOfferStoreCatalog(supabase);
  return catalog.cities;
}

type QueryRegionalOffersOptions = {
  userId: string;
  /** Filtro legado: apenas nome da cidade (sem raio). */
  city?: string | null;
  /** Região completa com raio — prioridade sobre `city` simples. */
  region?: UserOfferRegion | null;
  scope?: OfferRegionScope;
  category?: OfferCategory | null;
  q?: string | null;
  favoritesOnly?: boolean;
  limit?: number;
  /** Evita segunda leitura de `regional_stores` na mesma request. */
  stores?: RegionalStoreGeo[];
};

export async function queryRegionalOffers(
  supabase: Client,
  options: QueryRegionalOffersOptions,
): Promise<RegionalOffer[]> {
  const favoriteIds = await fetchUserFavoriteOfferIds(supabase, options.userId);

  if (options.favoritesOnly && favoriteIds.size === 0) {
    return [];
  }

  const scope = options.scope ?? "within_radius";
  const cap = await getOffersSchemaCapability(supabase);
  const useGeoRegion = Boolean(options.region?.radiusKm) && cap.storeGeo;

  let storeIdFilter: string[] | null = null;
  const storeMeta = new Map<
    string,
    { distanceKm: number; regionScope: OfferRegionScope }
  >();

  if (useGeoRegion && options.region) {
    const stores =
      options.stores ?? (await fetchActiveRegionalStores(supabase));
    const matches = filterStoresByRegionScope(stores, options.region, scope);
    storeIdFilter = matches.map((entry) => entry.store.id);
    for (const match of matches) {
      storeMeta.set(match.store.id, {
        distanceKm: match.distanceKm,
        regionScope: match.scope,
      });
    }
    if (storeIdFilter.length === 0) return [];
  }

  let query = supabase
    .from("regional_offers")
    .select(OFFER_SELECT)
    .eq("is_active", true)
    .gt("valid_until", new Date().toISOString())
    .order("valid_until", { ascending: true })
    .limit(options.limit ?? 48);

  if (storeIdFilter) {
    query = query.in("store_id", storeIdFilter);
  } else if (options.city) {
    query = query.eq("store.city", options.city);
  } else if (options.region?.city && !useGeoRegion) {
    query = query.eq("store.city", options.region.city);
  }

  if (options.category) {
    query = query.eq("category", options.category);
  }

  if (options.favoritesOnly) {
    query = query.in("id", [...favoriteIds]);
  }

  const { data, error } = await query;

  if (error) throw error;

  let rows = offersWithStore((data ?? []) as OfferQueryRow[]);

  if (!useGeoRegion && options.region) {
    rows = rows.filter((row) =>
      isSameCity(
        row.store.city,
        row.store.state,
        options.region!.city,
        options.region!.state,
      ),
    );
  }

  if (options.q?.trim()) {
    const term = options.q.trim().toLowerCase();
    rows = rows.filter(
      (row) =>
        row.title.toLowerCase().includes(term) ||
        row.product_name.toLowerCase().includes(term) ||
        row.store.name.toLowerCase().includes(term) ||
        row.store.chain.toLowerCase().includes(term),
    );
  }

  const mapped = rows.map((row) => {
    const meta = storeMeta.get(row.store_id);
    return mapOfferRow(row, favoriteIds, meta);
  });

  if (useGeoRegion) {
    return mapped.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
  }

  return mapped;
}

type ScoredOffer = {
  offer: RegionalOffer;
  score: number;
};

function scoreAndSortOffers(
  offers: RegionalOffer[],
  ingredientTerms: string[],
): ScoredOffer[] {
  return offers
    .map((offer) => ({
      offer,
      score: scoreOfferForRecipe(offer, ingredientTerms),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.offer.discountPercent ?? 0) - (a.offer.discountPercent ?? 0),
    );
}

function enrichMatchedOffers(
  entries: ScoredOffer[],
  ingredientNames: string[],
  options: { isCrossCity: boolean },
): RegionalOffer[] {
  return entries.map(({ offer, score }) => ({
    ...offer,
    matchScore: score,
    isSuggested: false,
    isCrossCity: options.isCrossCity,
    matchedIngredients: getOfferMatchedIngredients(offer, ingredientNames),
  }));
}

function buildAlternateCities(
  entries: ScoredOffer[],
  excludeCity: string,
): OfferAlternateCity[] {
  const counts = new Map<string, number>();

  for (const { offer } of entries) {
    if (offer.store.city === excludeCity) continue;
    counts.set(offer.store.city, (counts.get(offer.store.city) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([city, matchCount]) => ({ city, matchCount }))
    .sort((a, b) => b.matchCount - a.matchCount);
}

export type RecipeOffersQueryResult = {
  offers: RegionalOffer[];
  hasIngredientMatches: boolean;
  matchScope: OfferMatchScope;
  ingredientNames: string[];
  alternateCities: OfferAlternateCity[];
};

export async function queryOffersForRecipe(
  supabase: Client,
  userId: string,
  recipe: Recipe,
  options?: {
    city?: string | null;
    region?: UserOfferRegion | null;
    scope?: OfferRegionScope;
    stores?: RegionalStoreGeo[];
  },
): Promise<RecipeOffersQueryResult> {
  const region = options?.region ?? null;
  const selectedCity = options?.city ?? region?.city ?? DEFAULT_OFFER_CITY;
  const scope = options?.scope ?? "within_radius";
  const ingredientTerms = extractRecipeIngredientTerms(recipe);
  const ingredientNames = extractRecipeIngredientNames(recipe);

  const allOffers = await queryRegionalOffers(supabase, {
    userId,
    limit: region ? 64 : 48,
    region: region ?? undefined,
    scope: region ? scope : undefined,
    city: region ? undefined : selectedCity,
    stores: options?.stores,
  });

  if (allOffers.length === 0 || ingredientTerms.length === 0) {
    return {
      offers: [],
      hasIngredientMatches: false,
      matchScope: "none",
      ingredientNames,
      alternateCities: [],
    };
  }

  const localOffers = region
    ? allOffers.filter((offer) => isLocalToRegion(offer, region))
    : allOffers.filter((offer) => offer.store.city === selectedCity);

  const localMatches = scoreAndSortOffers(localOffers, ingredientTerms);

  if (localMatches.length > 0) {
    return {
      hasIngredientMatches: true,
      matchScope: "local",
      ingredientNames,
      alternateCities: [],
      offers: enrichMatchedOffers(localMatches, ingredientNames, {
        isCrossCity: false,
      }).slice(0, 8),
    };
  }

  const crossCityOffers = region
    ? allOffers.filter((offer) => isNearbyToRegion(offer, region))
    : allOffers.filter((offer) => offer.store.city !== selectedCity);

  const crossCityMatches = scoreAndSortOffers(crossCityOffers, ingredientTerms);

  if (crossCityMatches.length > 0) {
    return {
      hasIngredientMatches: true,
      matchScope: "cross_city",
      ingredientNames,
      alternateCities: buildAlternateCities(crossCityMatches, selectedCity),
      offers: enrichMatchedOffers(crossCityMatches, ingredientNames, {
        isCrossCity: true,
      }).slice(0, 8),
    };
  }

  const globalMatches = scoreAndSortOffers(allOffers, ingredientTerms);

  return {
    hasIngredientMatches: false,
    matchScope: "none",
    ingredientNames,
    alternateCities: buildAlternateCities(globalMatches, selectedCity),
    offers: [],
  };
}

export async function getOfferById(
  supabase: Client,
  userId: string,
  offerId: string,
): Promise<RegionalOffer | null> {
  const favoriteIds = await fetchUserFavoriteOfferIds(supabase, userId);

  const { data, error } = await supabase
    .from("regional_offers")
    .select(OFFER_SELECT)
    .eq("id", offerId)
    .eq("is_active", true)
    .gt("valid_until", new Date().toISOString())
    .single();

  if (error || !data) return null;

  const row = data as OfferQueryRow;
  if (!isOfferWithStore(row)) return null;

  return mapOfferRow(row, favoriteIds);
}

/** IDs de lojas ativas dentro da região (uso futuro: parceiros / cache). */
export async function resolveStoreIdsForRegion(
  supabase: Client,
  region: UserOfferRegion,
  scope: OfferRegionScope = "within_radius",
): Promise<string[]> {
  const stores = await fetchActiveRegionalStores(supabase);
  return filterStoreIdsByRegionScope(stores, region, scope);
}
