import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchDashboardStats } from "@/lib/queries/dashboard";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import type { UserOfferRegion } from "@/modules/offers/region/types";
import { queryRegionalOffers } from "@/modules/offers/services/offers";
import { getUserOfferRegion } from "@/modules/offers/services/region";
import { RECIPE_LIST_SELECT } from "@/lib/recipes/list-select";
import {
  selectEconomicalRecipes,
  selectRecipesOfTheDay,
} from "@/modules/home/utils/recipe-selection";
import type { HomeFeedResponse } from "@/modules/home/types";
import {
  fetchShoppingListItems,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";
import type { Database, Recipe } from "@/types/database";

type Client = SupabaseClient<Database>;

function sortOffersByDiscount<T extends { discountPercent?: number | null }>(
  offers: T[],
) {
  return [...offers].sort(
    (a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
  );
}

export async function fetchHomeFeed(
  supabase: Client,
  userId: string,
  regionOverride?: Partial<UserOfferRegion>,
): Promise<HomeFeedResponse> {
  const profileRegion = await getUserOfferRegion(supabase, userId);
  const region = buildUserOfferRegion({
    city: regionOverride?.city ?? profileRegion.city,
    state: regionOverride?.state ?? profileRegion.state,
    radiusKm: regionOverride?.radiusKm ?? profileRegion.radiusKm,
  });
  const statsPromise = fetchDashboardStats(supabase, userId);

  const recipesPromise = supabase
    .from("recipes")
    .select(RECIPE_LIST_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(24);

  const favoritesPromise = supabase
    .from("favorites")
    .select(`recipe_id, recipes(${RECIPE_LIST_SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(6);

  const offersPromise = queryRegionalOffers(supabase, {
    userId,
    region,
    scope: "within_radius",
    limit: 12,
  });

  const shoppingPromise = resolveShoppingList(supabase, userId).then(
    async (list) => {
      const items = await fetchShoppingListItems(supabase, list.id);
      const pending = items.filter((item) => !item.is_checked);
      return {
        listId: list.id,
        listName: list.name,
        pendingCount: pending.length,
        items: pending.slice(0, 5).map((item) => ({
          id: item.id,
          name: item.name,
          is_checked: item.is_checked,
          category: item.category,
        })),
      };
    },
  );

  const [stats, recipesResult, favoritesResult, offers, shopping] =
    await Promise.all([
      statsPromise,
      recipesPromise,
      favoritesPromise,
      offersPromise,
      shoppingPromise.catch(() => null),
    ]);

  const recipes = (recipesResult.data ?? []) as Recipe[];
  const favoriteRows = favoritesResult.data ?? [];

  const favoritesPreview = favoriteRows
    .map((row) => row.recipes)
    .filter((recipe): recipe is Recipe => Boolean(recipe));

  const favoriteIds = favoriteRows.map((row) => row.recipe_id);

  return {
    greeting: {
      firstName: stats.firstName,
      plan: stats.plan,
    },
    stats: {
      pantryCount: stats.pantryCount,
      recipeCount: stats.recipeCount,
      shoppingPendingCount: stats.shoppingPendingCount,
      favoritesCount: stats.favoritesCount,
      aiRemaining: stats.aiRemaining,
    },
    recipesOfTheDay: selectRecipesOfTheDay(recipes),
    economicalRecipes: selectEconomicalRecipes(recipes),
    favoritesPreview,
    favoriteIds,
    shopping,
    nearbyOffers: sortOffersByDiscount(offers).slice(0, 4),
    city: region.city,
    region,
  };
}
