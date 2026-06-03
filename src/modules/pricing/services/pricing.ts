import type { SupabaseClient } from "@supabase/supabase-js";

import { BASIC_BASKET_ITEMS } from "@/modules/pricing/constants/basic-basket";
import { assemblePriceComparison } from "@/modules/pricing/services/compare-engine";
import type {
  CompareCustomParams,
  CompareFromListParams,
  CompareItemInput,
  PriceComparisonResponse,
} from "@/modules/pricing/types";
import { queryRegionalOffers } from "@/modules/offers/services/offers";
import {
  fetchShoppingListItems,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const OFFERS_LIMIT = 250;

async function loadCityOffers(supabase: Client, userId: string, city: string) {
  return queryRegionalOffers(supabase, {
    userId,
    city,
    limit: OFFERS_LIMIT,
  });
}

export async function compareShoppingListPrices(
  supabase: Client,
  userId: string,
  params: CompareFromListParams,
): Promise<PriceComparisonResponse> {
  const list = await resolveShoppingList(supabase, userId, params.listId);
  const listItems = await fetchShoppingListItems(supabase, list.id);

  const items: CompareItemInput[] = listItems
    .filter((item) => !item.is_checked)
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity ?? 1,
    }));

  if (items.length === 0) {
    return assemblePriceComparison(params.city, "list", [], [], list.id);
  }

  const offers = await loadCityOffers(supabase, userId, params.city);
  return assemblePriceComparison(params.city, "list", items, offers, list.id);
}

export async function compareBasicBasketPrices(
  supabase: Client,
  userId: string,
  city: string,
): Promise<PriceComparisonResponse> {
  const offers = await loadCityOffers(supabase, userId, city);
  return assemblePriceComparison(city, "basket", BASIC_BASKET_ITEMS, offers);
}

export async function compareCustomItemsPrices(
  supabase: Client,
  userId: string,
  params: CompareCustomParams,
): Promise<PriceComparisonResponse> {
  const offers = await loadCityOffers(supabase, userId, params.city);
  return assemblePriceComparison(params.city, "custom", params.items, offers);
}
