import type { ShoppingList, ShoppingListItem } from "@/types/database";

export type ShoppingItemSource = "manual" | "recipe" | "offer" | "ai";

export type ShoppingItemCategory =
  | "HORTIFRUTI"
  | "CARNES"
  | "LATICINIOS"
  | "MERCEARIA"
  | "PADARIA"
  | "BEBIDAS"
  | "LIMPEZA"
  | "OUTROS";

export type SmartShoppingListItem = ShoppingListItem & {
  category: ShoppingItemCategory;
  source: ShoppingItemSource;
  recipe_id: string | null;
  offer_id: string | null;
  unit_price: number | null;
  estimated_savings: number | null;
};

export type ShoppingListSummary = {
  totalItems: number;
  pendingItems: number;
  checkedItems: number;
  confirmedSavings: number;
  potentialSavings: number;
};

export type ShoppingOfferMatch = {
  itemId: string;
  itemName: string;
  offerId: string;
  offerTitle: string;
  storeChain: string;
  storeCity: string;
  currentPrice: number;
  previousPrice: number | null;
  estimatedSavings: number;
};

export type SmartShoppingListResponse = {
  list: ShoppingList;
  items: SmartShoppingListItem[];
  summary: ShoppingListSummary;
  offerMatches: ShoppingOfferMatch[];
};

export type ShoppingListsResponse = {
  lists: ShoppingList[];
  activeListId: string;
};

export type AddFromFavoritesResponse = {
  added: number;
  skipped: number;
  recipesProcessed: number;
};

export type ConsolidatedShoppingLine = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingItemCategory;
  categoryLabel: string;
  recipeIds: string[];
  recipeTitles: string[];
  unitFamily: string;
  estimated: boolean;
};

export type GenerateShoppingListResponse = {
  items: ConsolidatedShoppingLine[];
  groupedByCategory: Partial<
    Record<ShoppingItemCategory, ConsolidatedShoppingLine[]>
  >;
  recipes: { id: string; title: string }[];
  totalLines: number;
  added: number;
  updated: number;
  skipped: number;
  persistedItems: SmartShoppingListItem[];
};
