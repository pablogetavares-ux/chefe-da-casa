import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { touchShoppingList } from "@/lib/shopping/list";
import { createClient } from "@/lib/supabase/server";
import { shoppingListItemSchema } from "@/lib/validations";
import {
  buildItemInsertRow,
  fetchShoppingListItems,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = shoppingListItemSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const list = await resolveShoppingList(
      supabase,
      user.id,
      parsed.data.listId,
    );
    const items = await fetchShoppingListItems(supabase, list.id);

    const maxSortOrder = items.reduce(
      (max, item) => Math.max(max, item.sort_order),
      0,
    );

    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert(
        buildItemInsertRow(list.id, {
          name: parsed.data.name,
          quantity: parsed.data.quantity,
          unit: parsed.data.unit,
          sortOrder: maxSortOrder + 1,
          source: "manual",
        }),
      )
      .select()
      .single();

    if (error || !data) {
      return apiError(error?.message ?? "Erro ao adicionar item", 500);
    }

    await touchShoppingList(list.id);

    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/shopping-list/items",
      "Erro ao adicionar item",
    );
  }
}
