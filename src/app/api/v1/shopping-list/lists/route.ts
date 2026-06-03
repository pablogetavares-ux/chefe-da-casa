import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { shoppingListCreateSchema } from "@/lib/validations";
import {
  fetchUserShoppingLists,
  resolveShoppingList,
} from "@/modules/shopping/services/shopping-list";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const lists = await fetchUserShoppingLists(supabase, user.id);
    const active = await resolveShoppingList(supabase, user.id);

    return apiSuccess({
      lists,
      activeListId: active.id,
    });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/shopping-list/lists",
      "Erro ao carregar listas",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = shoppingListCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: user.id,
        name: parsed.data.name.trim(),
      })
      .select()
      .single();

    if (error || !data) {
      return apiError(error?.message ?? "Erro ao criar lista", 500);
    }

    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/shopping-list/lists",
      "Erro ao criar lista",
    );
  }
}
