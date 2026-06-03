import type { SupabaseClient } from "@supabase/supabase-js";

import {
  compareMarketsForShoppingList,
  type MarketsCompareResult,
  type ShoppingListCompareItem,
} from "@/lib/markets/compare-shopping-list";
import { loadProductsWithPrices } from "@/modules/recipes/services/recipe-cost";
import {
  fetchShoppingListItems,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function loadShoppingListCompareItems(
  supabase: Client,
  userId: string,
  listId?: string,
): Promise<{ listId: string; items: ShoppingListCompareItem[] }> {
  const list = await resolveShoppingList(supabase, userId, listId);
  const rows = await fetchShoppingListItems(supabase, list.id);

  const items = rows
    .filter((row) => !row.is_checked)
    .map((row) => ({
      id: row.id,
      name: row.name,
      quantity: row.quantity ?? 1,
      unit: row.unit ?? "un",
    }));

  return { listId: list.id, items };
}

export async function compareMarketsFromShoppingList(
  supabase: Client,
  userId: string,
  input: {
    listId?: string;
    items?: ShoppingListCompareItem[];
  },
): Promise<MarketsCompareResult> {
  let listId: string | null = input.listId ?? null;
  let items = input.items ?? [];

  if (listId) {
    const loaded = await loadShoppingListCompareItems(supabase, userId, listId);
    listId = loaded.listId;
    if (!input.items?.length) {
      items = loaded.items;
    }
  }

  if (items.length === 0) {
    throw new Error("Lista de compras vazia ou sem itens pendentes");
  }

  const products = await loadProductsWithPrices(supabase);
  return compareMarketsForShoppingList(items, products, listId);
}
