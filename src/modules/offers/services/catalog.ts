import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  OfferCategoryCatalogItem,
  OfferVerticalCatalogItem,
} from "@/modules/offers/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export const DEFAULT_OFFER_VERTICAL_SLUG = "supermarket" as const;

/** Verticais exibidas no hub (ordem fixa de produto). */
export const OFFER_HUB_VERTICAL_SLUGS = [
  "supermarket",
  "pharmacy",
  "pet_shop",
  "clothing",
  "footwear",
  "construction",
  "electronics",
] as const;

export type OfferHubVerticalSlug = (typeof OFFER_HUB_VERTICAL_SLUGS)[number];

export function isOfferHubVerticalSlug(
  slug: string,
): slug is OfferHubVerticalSlug {
  return (OFFER_HUB_VERTICAL_SLUGS as readonly string[]).includes(slug);
}

export type OfferCatalog = {
  verticals: OfferVerticalCatalogItem[];
  categories: OfferCategoryCatalogItem[];
};

let cachedCatalog: OfferCatalog | null = null;
let catalogCachedAt = 0;
let inflightCatalog: Promise<OfferCatalog> | null = null;
const CATALOG_CACHE_MS = 60_000;

function mapVertical(row: {
  id: string;
  slug: string;
  name: string;
  icon_key: string | null;
  description?: string | null;
  is_active?: boolean;
  sort_order: number;
}): OfferVerticalCatalogItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    iconKey: row.icon_key,
    description: row.description ?? null,
    isActive: row.is_active ?? false,
    sortOrder: row.sort_order,
  };
}

function mapCategory(row: {
  id: string;
  slug: string;
  name: string;
  vertical_id: string;
  legacy_enum: Database["public"]["Enums"]["OfferCategory"] | null;
  parent_id: string | null;
  sort_order: number;
  vertical: { slug: string } | null;
}): OfferCategoryCatalogItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    verticalId: row.vertical_id,
    verticalSlug: row.vertical?.slug ?? DEFAULT_OFFER_VERTICAL_SLUG,
    legacyEnum: row.legacy_enum,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
  };
}

async function loadOfferCatalog(supabase: Client): Promise<OfferCatalog> {
  const [verticalsResult, categoriesResult] = await Promise.all([
    supabase
      .from("offer_verticals")
      .select("id, slug, name, icon_key, description, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("offer_categories")
      .select(
        "id, slug, name, vertical_id, legacy_enum, parent_id, sort_order, vertical:offer_verticals!offer_categories_vertical_id_fkey (slug)",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (verticalsResult.error) throw verticalsResult.error;
  if (categoriesResult.error) throw categoriesResult.error;

  const catalog: OfferCatalog = {
    verticals: (verticalsResult.data ?? []).map(mapVertical),
    categories: (categoriesResult.data ?? []).map((row) => mapCategory(row)),
  };

  if (catalog.verticals.length > 0) {
    cachedCatalog = catalog;
    catalogCachedAt = Date.now();
  }

  return catalog;
}

/** Catálogo de verticais e categorias (cache por processo). */
export async function fetchOfferCatalog(
  supabase: Client,
): Promise<OfferCatalog> {
  const cacheFresh =
    cachedCatalog && Date.now() - catalogCachedAt < CATALOG_CACHE_MS;

  if (cacheFresh && cachedCatalog) return cachedCatalog;

  if (!cacheFresh) {
    cachedCatalog = null;
  }

  if (!inflightCatalog) {
    inflightCatalog = loadOfferCatalog(supabase).finally(() => {
      inflightCatalog = null;
    });
  }

  return inflightCatalog;
}

export function filterCatalogByVertical(
  catalog: OfferCatalog,
  verticalSlug: string,
): OfferCatalog {
  const vertical = catalog.verticals.find((item) => item.slug === verticalSlug);
  if (!vertical) {
    return { verticals: catalog.verticals, categories: [] };
  }

  return {
    verticals: catalog.verticals,
    categories: catalog.categories.filter(
      (item) => item.verticalId === vertical.id,
    ),
  };
}

export function resolveCategoryFromSlug(
  catalog: OfferCatalog,
  verticalSlug: string,
  categorySlug: string | null | undefined,
): OfferCategoryCatalogItem | null {
  if (!categorySlug) return null;
  return (
    catalog.categories.find(
      (item) =>
        item.slug === categorySlug && item.verticalSlug === verticalSlug,
    ) ?? null
  );
}

export function resetOfferCatalogCache() {
  cachedCatalog = null;
  catalogCachedAt = 0;
  inflightCatalog = null;
  cachedHubVerticals = null;
  inflightHubVerticals = null;
  hubVerticalsCachedAt = 0;
}

let cachedHubVerticals: OfferVerticalCatalogItem[] | null = null;
let inflightHubVerticals: Promise<OfferVerticalCatalogItem[]> | null = null;
let hubVerticalsCachedAt = 0;
const HUB_VERTICALS_CACHE_MS = 60_000;

async function fetchVerticalActiveOfferCounts(
  supabase: Client,
): Promise<Record<string, number>> {
  const { data, error } = await supabase.rpc("count_active_offers_by_vertical");

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const slug = row.vertical_slug as string | null;
    if (slug) {
      counts[slug] = Number(row.offer_count ?? 0);
    }
  }
  return counts;
}

/** Verticais do hub — inclui inativas (Em breve) + contagem de ofertas ativas. */
export async function fetchOfferHubVerticals(
  supabase: Client,
): Promise<OfferVerticalCatalogItem[]> {
  const cacheFresh =
    cachedHubVerticals &&
    Date.now() - hubVerticalsCachedAt < HUB_VERTICALS_CACHE_MS;

  if (cacheFresh && cachedHubVerticals) {
    const counts = await fetchVerticalActiveOfferCounts(supabase);
    return cachedHubVerticals.map((vertical) => ({
      ...vertical,
      activeOfferCount: counts[vertical.slug] ?? 0,
    }));
  }

  if (!cacheFresh) {
    cachedHubVerticals = null;
  }

  if (!inflightHubVerticals) {
    inflightHubVerticals = (async () => {
      const { data, error } = await supabase
        .from("offer_verticals")
        .select("id, slug, name, icon_key, description, is_active, sort_order")
        .in("slug", [...OFFER_HUB_VERTICAL_SLUGS])
        .order("sort_order", { ascending: true });

      if (error) throw error;
      const mapped = (data ?? []).map(mapVertical);
      if (mapped.length > 0) {
        cachedHubVerticals = mapped;
        hubVerticalsCachedAt = Date.now();
      }
      return mapped;
    })().finally(() => {
      inflightHubVerticals = null;
    });
  }

  const verticals = await inflightHubVerticals;
  const counts = await fetchVerticalActiveOfferCounts(supabase);
  return verticals.map((vertical) => ({
    ...vertical,
    activeOfferCount: counts[vertical.slug] ?? 0,
  }));
}
