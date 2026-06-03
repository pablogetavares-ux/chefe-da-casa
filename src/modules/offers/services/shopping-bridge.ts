import { getOfferById } from "@/modules/offers/services/offers";
import {
  buildItemInsertRow,
  fetchShoppingListItems,
  resolveShoppingList,
  touchShoppingListById,
} from "@/modules/shopping/services/shopping-list";
import { computeOfferSavings } from "@/modules/shopping/services/savings";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export async function addOfferToShoppingList(
  supabase: SupabaseClient<Database>,
  userId: string,
  offerId: string,
  listId?: string | null,
) {
  const offer = await getOfferById(supabase, userId, offerId);

  if (!offer) {
    throw new Error("Oferta não encontrada ou expirada");
  }

  const list = await resolveShoppingList(supabase, userId, listId);
  const items = await fetchShoppingListItems(supabase, list.id);
  const normalizedName = offer.product_name.trim().toLowerCase();
  const alreadyListed = items.some(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  );

  if (alreadyListed) {
    return { added: false, message: "Item já está na lista de compras" };
  }

  const maxSortOrder = items.reduce(
    (max, item) => Math.max(max, item.sort_order),
    0,
  );

  const savings = computeOfferSavings(
    offer.current_price,
    offer.previous_price,
  );

  const note = `${offer.store.chain} · ${formatOfferPriceLabel(offer.current_price, offer.unit)}`;

  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert(
      buildItemInsertRow(list.id, {
        name: offer.product_name,
        quantity: 1,
        unit: offer.unit,
        sortOrder: maxSortOrder + 1,
        source: "offer",
        offerId: offer.id,
        unitPrice: offer.current_price,
        estimatedSavings: savings,
      }),
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Erro ao adicionar à lista");
  }

  await touchShoppingListById(supabase, list.id);

  return {
    added: true,
    item: data,
    message: `Adicionado — promo ${offer.store.chain} (${note})`,
  };
}

function formatOfferPriceLabel(price: number, unit: string | null) {
  const formatted = price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return unit ? `${formatted}/${unit}` : formatted;
}
