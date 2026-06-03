/** Chaves centralizadas do React Query — evita cache stale por typo. */

export const homeFeedQueryKey = (city?: string) =>
  ["home-feed", city ?? "default"] as const;

export const ECONOMY_DASHBOARD_QUERY_KEY = ["economy-dashboard"] as const;
export const MONTHLY_PURCHASES_QUERY_KEY = ["monthly-purchases"] as const;
export const MONTHLY_PURCHASES_HISTORY_QUERY_KEY = [
  ...MONTHLY_PURCHASES_QUERY_KEY,
  "history",
] as const;

export const monthlyPurchasesDashboardQueryKey = (
  month: number,
  year: number,
) => [...MONTHLY_PURCHASES_QUERY_KEY, "dashboard", month, year] as const;

export const SHOPPING_LIST_QUERY_KEY = "shopping-list";
export const SHOPPING_LISTS_QUERY_KEY = "shopping-lists";

export function shoppingListQueryKey(listId?: string) {
  return [SHOPPING_LIST_QUERY_KEY, listId ?? "default"] as const;
}

export const OFFERS_QUERY_PREFIX = "offers" as const;
export const OFFERS_FOR_RECIPE_QUERY_PREFIX = "offers-for-recipe" as const;
export const OFFERS_REGION_QUERY_KEY = ["offers", "region"] as const;
export const PRICING_COMPARE_QUERY_PREFIX = "pricing-compare" as const;
export const MARKETS_COMPARE_QUERY_PREFIX = "markets-compare" as const;
export const RECIPE_SUBSTITUTIONS_QUERY_PREFIX =
  "recipe-substitutions" as const;

export const HOME_FEED_INVALIDATION = [["home-feed"]] as const;

export const SHOPPING_INVALIDATION = [
  shoppingListQueryKey(),
  [SHOPPING_LISTS_QUERY_KEY],
  ...HOME_FEED_INVALIDATION,
] as const;

export function marketsCompareQueryKey(listId?: string) {
  return [MARKETS_COMPARE_QUERY_PREFIX, listId ?? "default"] as const;
}

export function recipeSubstitutionsQueryKey(recipeId: string) {
  return [RECIPE_SUBSTITUTIONS_QUERY_PREFIX, recipeId] as const;
}

export function pricingCompareQueryKey(filters: {
  mode: string;
  city: string;
  listId?: string;
  customItemsKey?: string;
}) {
  return [
    PRICING_COMPARE_QUERY_PREFIX,
    filters.mode,
    filters.city,
    filters.listId ?? "default-list",
    filters.customItemsKey ?? "",
  ] as const;
}

export const RECIPE_INVALIDATION = [
  ["recipes"],
  ["favorites"],
  ...HOME_FEED_INVALIDATION,
] as const;

export const RECIPE_AI_INVALIDATION = [
  ["recipes"],
  ["ai-usage"],
  ["ai-history"],
  ...HOME_FEED_INVALIDATION,
] as const;

export const PANTRY_INVALIDATION = [
  ["pantry"],
  ...HOME_FEED_INVALIDATION,
] as const;

export const OFFERS_INVALIDATION = [
  [OFFERS_QUERY_PREFIX],
  [OFFERS_FOR_RECIPE_QUERY_PREFIX],
] as const;

export const OFFERS_SHOPPING_INVALIDATION = [
  ...SHOPPING_INVALIDATION,
  ...OFFERS_INVALIDATION,
  ...HOME_FEED_INVALIDATION,
] as const;
