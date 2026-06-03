import { createClient } from "@/lib/supabase/server";
import {
  fetchShoppingListItems,
  resolveShoppingList,
  touchShoppingListById,
} from "@/modules/shopping/services/shopping-list";
import type { ShoppingList, ShoppingListItem } from "@/types/database";

export type ShoppingListPayload = {
  list: ShoppingList;
  items: ShoppingListItem[];
};

/** @deprecated Prefer buildSmartShoppingResponse — mantido para rotas legadas. */
export async function getOrCreateShoppingList(
  userId: string,
  listId?: string | null,
): Promise<ShoppingListPayload> {
  const supabase = await createClient();
  const list = await resolveShoppingList(supabase, userId, listId);
  const items = await fetchShoppingListItems(supabase, list.id);
  return { list, items };
}

export async function touchShoppingList(listId: string) {
  const supabase = await createClient();
  await touchShoppingListById(supabase, listId);
}
