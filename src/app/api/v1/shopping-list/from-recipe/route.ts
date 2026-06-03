import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import {
  getMissingIngredients,
  normalizeIngredientName,
} from "@/lib/shopping/missing-ingredients";
import { parseRecipeIngredients } from "@/lib/shopping/recipe-ingredients";
import { touchShoppingList } from "@/lib/shopping/list";
import { createClient } from "@/lib/supabase/server";
import { shoppingListFromRecipeSchema } from "@/lib/validations";
import {
  buildItemInsertRow,
  fetchShoppingListItems,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";
export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = shoppingListFromRecipeSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();

    const [{ data: recipe }, { data: pantryItems }] = await Promise.all([
      supabase
        .from("recipes")
        .select("id, title, ingredients, is_ai_generated")
        .eq("id", parsed.data.recipeId)
        .eq("user_id", user.id)
        .single(),
      supabase.from("pantry_items").select("name").eq("user_id", user.id),
    ]);

    if (!recipe) {
      return apiError("Receita não encontrada", 404);
    }

    const recipeIngredients = parseRecipeIngredients(recipe.ingredients);
    const pantryNames = (pantryItems ?? []).map((item) => item.name);
    const missing = getMissingIngredients(recipeIngredients, pantryNames);

    if (missing.length === 0) {
      return apiSuccess({ added: 0, skipped: 0, items: [] });
    }

    const list = await resolveShoppingList(
      supabase,
      user.id,
      parsed.data.listId,
    );
    const existingItems = await fetchShoppingListItems(supabase, list.id);

    const existingNames = new Set(
      existingItems.map((item) => normalizeIngredientName(item.name)),
    );

    const toInsert = missing.filter(
      (ingredient) =>
        !existingNames.has(normalizeIngredientName(ingredient.name)),
    );

    const skipped = missing.length - toInsert.length;

    if (toInsert.length === 0) {
      return apiSuccess({
        added: 0,
        skipped,
        items: [],
        message: "Itens já estavam na lista",
      });
    }

    const maxSortOrder = existingItems.reduce(
      (max, item) => Math.max(max, item.sort_order),
      0,
    );

    const rows = toInsert.map((ingredient, index) =>
      buildItemInsertRow(list.id, {
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        sortOrder: maxSortOrder + index + 1,
        source: recipe.is_ai_generated ? "ai" : "recipe",
        recipeId: recipe.id,
      }),
    );

    const { data: inserted, error } = await supabase
      .from("shopping_list_items")
      .insert(rows)
      .select();

    if (error) {
      return apiError(error.message, 500);
    }

    await touchShoppingList(list.id);

    return apiSuccess(
      {
        added: inserted?.length ?? 0,
        skipped,
        items: inserted ?? [],
        recipeTitle: recipe.title,
      },
      201,
    );
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/shopping-list/from-recipe",
      "Erro ao importar receita",
    );
  }
}
