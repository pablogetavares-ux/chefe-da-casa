import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildItemInsertRow,
  fetchShoppingListItems,
  resolveShoppingList,
  touchShoppingListById,
} from "@/modules/shopping/services/shopping-list";
import {
  getMissingIngredients,
  normalizeIngredientName,
} from "@/lib/shopping/missing-ingredients";
import type { Database, Recipe } from "@/types/database";
import type { RecipeIngredient } from "@/types";

type Client = SupabaseClient<Database>;

function parseIngredients(raw: unknown): RecipeIngredient[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RecipeIngredient =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      typeof (item as RecipeIngredient).name === "string",
  );
}

export async function addMissingFromFavoriteRecipes(
  supabase: Client,
  userId: string,
  listId?: string | null,
) {
  const list = await resolveShoppingList(supabase, userId, listId);

  const { data: favorites, error: favError } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId);

  if (favError) throw favError;

  const recipeIds = (favorites ?? []).map((row) => row.recipe_id);
  if (recipeIds.length === 0) {
    return { added: 0, skipped: 0, recipesProcessed: 0 };
  }

  const { data: recipes, error: recipesError } = await supabase
    .from("recipes")
    .select("id, title, ingredients")
    .eq("user_id", userId)
    .in("id", recipeIds);

  if (recipesError) throw recipesError;

  const { data: pantryItems } = await supabase
    .from("pantry_items")
    .select("name")
    .eq("user_id", userId);

  const pantryNames = (pantryItems ?? []).map((item) => item.name);
  const existingItems = await fetchShoppingListItems(supabase, list.id);
  const existingNames = new Set(
    existingItems.map((item) => normalizeIngredientName(item.name)),
  );

  const toInsertMap = new Map<
    string,
    {
      name: string;
      quantity?: number | null;
      unit?: string | null;
      recipeId: string;
    }
  >();

  for (const recipe of (recipes ?? []) as Pick<
    Recipe,
    "id" | "title" | "ingredients"
  >[]) {
    const missing = getMissingIngredients(
      parseIngredients(recipe.ingredients),
      pantryNames,
    );

    for (const ingredient of missing) {
      const key = normalizeIngredientName(ingredient.name);
      if (existingNames.has(key) || toInsertMap.has(key)) continue;
      toInsertMap.set(key, {
        name: ingredient.name,
        quantity: ingredient.quantity ?? null,
        unit: ingredient.unit ?? null,
        recipeId: recipe.id,
      });
    }
  }

  if (toInsertMap.size === 0) {
    return {
      added: 0,
      skipped: 0,
      recipesProcessed: recipes?.length ?? 0,
    };
  }

  const maxSortOrder = existingItems.reduce(
    (max, item) => Math.max(max, item.sort_order),
    0,
  );

  const rows = [...toInsertMap.values()].map((entry, index) =>
    buildItemInsertRow(list.id, {
      name: entry.name,
      quantity: entry.quantity,
      unit: entry.unit,
      sortOrder: maxSortOrder + index + 1,
      source: "recipe",
      recipeId: entry.recipeId,
    }),
  );

  const { data: inserted, error } = await supabase
    .from("shopping_list_items")
    .insert(rows)
    .select();

  if (error) throw error;

  await touchShoppingListById(supabase, list.id);

  return {
    added: inserted?.length ?? 0,
    skipped: 0,
    recipesProcessed: recipes?.length ?? 0,
  };
}
