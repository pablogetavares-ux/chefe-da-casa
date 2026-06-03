import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildPantryNameSet,
  isIngredientInPantry,
} from "@/lib/shopping/missing-ingredients";
import {
  consolidateIngredientsFromRecipes,
  type ConsolidatedShoppingList,
} from "@/lib/shopping/consolidate-ingredients";
import { mergeKey } from "@/lib/shopping/consolidate-ingredients";
import { toBaseQuantity, formatDisplayQuantity } from "@/lib/shopping/units";
import {
  buildItemInsertRow,
  fetchShoppingListItems,
  resolveShoppingList,
  touchShoppingListById,
} from "@/modules/shopping/services/shopping-list";
import type { SmartShoppingListItem } from "@/modules/shopping/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type GenerateShoppingListInput = {
  recipeIds: string[];
  listId?: string;
  excludePantry?: boolean;
  persist?: boolean;
};

export type GenerateShoppingListResult = ConsolidatedShoppingList & {
  added: number;
  updated: number;
  skipped: number;
  persistedItems: SmartShoppingListItem[];
};

export async function generateShoppingListFromRecipes(
  supabase: Client,
  userId: string,
  input: GenerateShoppingListInput,
): Promise<GenerateShoppingListResult> {
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, ingredients")
    .eq("user_id", userId)
    .in("id", input.recipeIds);

  if (error) throw new Error(error.message);

  const found = recipes ?? [];
  if (found.length !== input.recipeIds.length) {
    throw new RecipeIdsNotFoundError();
  }

  let consolidated = consolidateIngredientsFromRecipes(found);

  if (input.excludePantry !== false) {
    const { data: pantryItems } = await supabase
      .from("pantry_items")
      .select("name")
      .eq("user_id", userId);

    const pantryNames = buildPantryNameSet(
      (pantryItems ?? []).map((p) => p.name),
    );

    const filtered = consolidated.items.filter(
      (item) => !isIngredientInPantry(item.name, pantryNames),
    );

    const groupedByCategory = { ...consolidated.groupedByCategory };
    for (const key of Object.keys(groupedByCategory) as Array<
      keyof typeof groupedByCategory
    >) {
      groupedByCategory[key] = groupedByCategory[key]!.filter(
        (item) => !isIngredientInPantry(item.name, pantryNames),
      );
      if (groupedByCategory[key]!.length === 0) {
        delete groupedByCategory[key];
      }
    }

    consolidated = {
      ...consolidated,
      items: filtered,
      groupedByCategory,
      totalLines: filtered.length,
    };
  }

  if (input.persist === false) {
    return {
      ...consolidated,
      added: 0,
      updated: 0,
      skipped: 0,
      persistedItems: [],
    };
  }

  const list = await resolveShoppingList(supabase, userId, input.listId);
  const existingItems = await fetchShoppingListItems(supabase, list.id);

  const existingByKey = new Map<string, SmartShoppingListItem>();
  for (const item of existingItems) {
    const unit = item.unit ?? "un";
    const qty = item.quantity ?? 1;
    const { family, baseLabel } = toBaseQuantity(qty, unit);
    const key = mergeKey(item.name, family, baseLabel);
    existingByKey.set(key, item);
  }

  let added = 0;
  let updated = 0;
  const skipped = 0;
  const persisted: SmartShoppingListItem[] = [];

  let sortOrder = existingItems.reduce(
    (max, item) => Math.max(max, item.sort_order),
    0,
  );

  for (const line of consolidated.items) {
    const { family, baseLabel, baseValue } = toBaseQuantity(
      line.quantity,
      line.unit,
    );
    const key = mergeKey(line.name, family, baseLabel);
    const existing = existingByKey.get(key);

    if (existing) {
      const existingBase = toBaseQuantity(
        existing.quantity ?? 1,
        existing.unit ?? "un",
      );
      const mergedBase = existingBase.baseValue + baseValue;
      const display = formatDisplayQuantity(
        mergedBase,
        family === "unknown" ? "count" : family,
        baseLabel,
      );

      const { data: updatedRow, error: updateError } = await supabase
        .from("shopping_list_items")
        .update({
          quantity: display.quantity,
          unit: display.unit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      if (updatedRow) {
        persisted.push(updatedRow as SmartShoppingListItem);
        existingByKey.set(key, updatedRow as SmartShoppingListItem);
        updated += 1;
      }
      continue;
    }

    sortOrder += 1;
    const row = buildItemInsertRow(list.id, {
      name: line.name,
      quantity: line.quantity,
      unit: line.unit,
      sortOrder,
      category: line.category,
      source: "recipe",
      recipeId: line.recipeIds[0] ?? null,
    });

    const { data: inserted, error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(row)
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    if (inserted) {
      persisted.push(inserted as SmartShoppingListItem);
      existingByKey.set(key, inserted as SmartShoppingListItem);
      added += 1;
    }
  }

  if (added > 0 || updated > 0) {
    await touchShoppingListById(supabase, list.id);
  }

  return {
    ...consolidated,
    added,
    updated,
    skipped,
    persistedItems: persisted,
  };
}

export class RecipeIdsNotFoundError extends Error {
  constructor() {
    super("RECIPE_IDS_NOT_FOUND");
    this.name = "RecipeIdsNotFoundError";
  }
}
