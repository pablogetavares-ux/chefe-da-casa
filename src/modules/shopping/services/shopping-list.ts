import type { SupabaseClient } from "@supabase/supabase-js";

import { inferShoppingCategory } from "@/modules/shopping/constants/categories";
import {
  computeOfferSavings,
  computeShoppingSummary,
  mergeSummaryPotential,
} from "@/modules/shopping/services/savings";
import type {
  ShoppingOfferMatch,
  SmartShoppingListItem,
  SmartShoppingListResponse,
} from "@/modules/shopping/types";
import { DEFAULT_OFFER_CITY } from "@/modules/offers/types";
import type { RegionalOffer } from "@/modules/offers/types";
import {
  queryRegionalOffers,
  getOfferById,
} from "@/modules/offers/services/offers";
import { scoreOfferForRecipe } from "@/modules/offers/utils/matching";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function fetchUserShoppingLists(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("shopping_lists")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function resolveShoppingList(
  supabase: Client,
  userId: string,
  listId?: string | null,
) {
  if (listId) {
    const { data, error } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (error || !data) throw new Error("Lista não encontrada");
    return data;
  }

  const lists = await fetchUserShoppingLists(supabase, userId);
  if (lists[0]) return lists[0];

  const { data: created, error } = await supabase
    .from("shopping_lists")
    .insert({ user_id: userId, name: "Lista de compras" })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Erro ao criar lista");
  }

  return created;
}

export async function fetchShoppingListItems(
  supabase: Client,
  listId: string,
): Promise<SmartShoppingListItem[]> {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .eq("shopping_list_id", listId)
    .order("is_checked", { ascending: true })
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SmartShoppingListItem[];
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export function matchOffersToItems(
  items: SmartShoppingListItem[],
  offers: RegionalOffer[],
): ShoppingOfferMatch[] {
  const pendingWithoutOffer = items.filter(
    (item) => !item.is_checked && !item.offer_id,
  );

  const matches: ShoppingOfferMatch[] = [];

  for (const item of pendingWithoutOffer) {
    const terms = [normalizeName(item.name)];
    let best: { offer: RegionalOffer; score: number } | null = null;

    for (const offer of offers) {
      const score = scoreOfferForRecipe(offer, terms);
      if (score <= 0) continue;
      if (!best || score > best.score) {
        best = { offer, score };
      }
    }

    if (!best) continue;

    const savings = computeOfferSavings(
      best.offer.current_price,
      best.offer.previous_price,
    );

    if (savings <= 0 && !best.offer.discountPercent) continue;

    matches.push({
      itemId: item.id,
      itemName: item.name,
      offerId: best.offer.id,
      offerTitle: best.offer.title,
      storeChain: best.offer.store.chain,
      storeCity: best.offer.store.city,
      currentPrice: best.offer.current_price,
      previousPrice: best.offer.previous_price,
      estimatedSavings: savings,
    });
  }

  return matches;
}

export async function buildSmartShoppingResponse(
  supabase: Client,
  userId: string,
  listId?: string | null,
): Promise<SmartShoppingListResponse> {
  const list = await resolveShoppingList(supabase, userId, listId);
  const items = await fetchShoppingListItems(supabase, list.id);
  const summary = computeShoppingSummary(items);

  const offers = await queryRegionalOffers(supabase, {
    userId,
    city: DEFAULT_OFFER_CITY,
    limit: 64,
  });

  const offerMatches = matchOffersToItems(items, offers);
  const potentialSavings = offerMatches.reduce(
    (sum, match) => sum + match.estimatedSavings,
    0,
  );

  return {
    list,
    items,
    summary: mergeSummaryPotential(summary, potentialSavings),
    offerMatches,
  };
}

export async function touchShoppingListById(supabase: Client, listId: string) {
  await supabase
    .from("shopping_lists")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", listId);
}

export async function linkOfferToShoppingItem(
  supabase: Client,
  userId: string,
  itemId: string,
  offerId: string,
) {
  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("id, shopping_list_id, name, offer_id")
    .eq("id", itemId)
    .single();

  if (!item) throw new Error("Item não encontrado");

  const { data: list } = await supabase
    .from("shopping_lists")
    .select("user_id")
    .eq("id", item.shopping_list_id)
    .single();

  if (!list || list.user_id !== userId) {
    throw new Error("Item não encontrado");
  }

  const offer = await getOfferById(supabase, userId, offerId);
  if (!offer) throw new Error("Oferta não encontrada ou expirada");

  const savings = computeOfferSavings(
    offer.current_price,
    offer.previous_price,
  );

  const { data, error } = await supabase
    .from("shopping_list_items")
    .update({
      offer_id: offer.id,
      source: "offer",
      unit_price: offer.current_price,
      estimated_savings: savings,
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Erro ao vincular oferta");
  }

  await touchShoppingListById(supabase, item.shopping_list_id);
  return data as SmartShoppingListItem;
}

export function buildItemInsertRow(
  listId: string,
  input: {
    name: string;
    quantity?: number | null;
    unit?: string | null;
    sortOrder: number;
    source?: SmartShoppingListItem["source"];
    recipeId?: string | null;
    offerId?: string | null;
    unitPrice?: number | null;
    estimatedSavings?: number | null;
    category?: string;
  },
) {
  return {
    shopping_list_id: listId,
    name: input.name.trim(),
    quantity: input.quantity ?? null,
    unit: input.unit ?? null,
    sort_order: input.sortOrder,
    category: input.category ?? inferShoppingCategory(input.name),
    source: input.source ?? "manual",
    recipe_id: input.recipeId ?? null,
    offer_id: input.offerId ?? null,
    unit_price: input.unitPrice ?? null,
    estimated_savings: input.estimatedSavings ?? null,
  };
}
