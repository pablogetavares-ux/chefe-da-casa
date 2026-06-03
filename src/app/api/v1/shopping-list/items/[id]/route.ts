import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { touchShoppingList } from "@/lib/shopping/list";
import { createClient } from "@/lib/supabase/server";
import { shoppingListItemUpdateSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function verifyItemOwnership(userId: string, itemId: string) {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("shopping_list_items")
    .select("id, shopping_list_id")
    .eq("id", itemId)
    .single();

  if (!item) return null;

  const { data: list } = await supabase
    .from("shopping_lists")
    .select("user_id")
    .eq("id", item.shopping_list_id)
    .single();

  if (!list || list.user_id !== userId) return null;

  return { itemId: item.id, listId: item.shopping_list_id };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = shoppingListItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const ownership = await verifyItemOwnership(user.id, id);
    if (!ownership) {
      return apiError("Item não encontrado", 404);
    }

    const updates: {
      name?: string;
      quantity?: number | null;
      unit?: string | null;
      is_checked?: boolean;
      category?: string;
    } = {};

    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.quantity !== undefined) {
      updates.quantity = parsed.data.quantity;
    }
    if (parsed.data.unit !== undefined) updates.unit = parsed.data.unit;
    if (parsed.data.isChecked !== undefined) {
      updates.is_checked = parsed.data.isChecked;
    }
    if (parsed.data.category !== undefined) {
      updates.category = parsed.data.category;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shopping_list_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return apiError(error?.message ?? "Erro ao atualizar item", 500);
    }

    await touchShoppingList(ownership.listId);

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(error, "PATCH /api/v1/shopping-list/items/[id]");
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;

    const ownership = await verifyItemOwnership(user.id, id);
    if (!ownership) {
      return apiError("Item não encontrado", 404);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", id);

    if (error) {
      return apiError(error.message, 500);
    }

    await touchShoppingList(ownership.listId);

    return apiSuccess({ id });
  } catch (error) {
    return handleApiRouteError(
      error,
      "DELETE /api/v1/shopping-list/items/[id]",
    );
  }
}
