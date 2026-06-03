import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { touchShoppingList } from "@/lib/shopping/list";
import { createClient } from "@/lib/supabase/server";
import { shoppingListQuerySchema } from "@/lib/validations";
import { resolveShoppingList } from "@/modules/shopping/services/shopping-list";

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const parsed = shoppingListQuerySchema.safeParse({
      listId: searchParams.get("listId") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const list = await resolveShoppingList(
      supabase,
      user.id,
      parsed.data.listId,
    );

    const { error, count } = await supabase
      .from("shopping_list_items")
      .delete({ count: "exact" })
      .eq("shopping_list_id", list.id)
      .eq("is_checked", true);

    if (error) {
      return apiError(error.message, 500);
    }

    await touchShoppingList(list.id);

    return apiSuccess({ removed: count ?? 0 });
  } catch (error) {
    return handleApiRouteError(
      error,
      "DELETE /api/v1/shopping-list/checked",
      "Erro ao limpar comprados",
    );
  }
}
