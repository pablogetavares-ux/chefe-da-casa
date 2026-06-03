import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { shoppingListUpdateSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = shoppingListUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const updates: { name?: string; notes?: string | null } = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shopping_lists")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      return apiError("Lista não encontrada", 404);
    }

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "PATCH /api/v1/shopping-list/lists/:id",
      "Erro ao atualizar lista",
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuthUser();
    const { id } = await params;
    const supabase = await createClient();

    const { count } = await supabase
      .from("shopping_lists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) <= 1) {
      return apiError("Mantenha pelo menos uma lista de compras", 400);
    }

    const { error } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return apiError(error.message, 500);
    }

    return apiSuccess({ id });
  } catch (error) {
    return handleApiRouteError(
      error,
      "DELETE /api/v1/shopping-list/lists/:id",
      "Erro ao excluir lista",
    );
  }
}
