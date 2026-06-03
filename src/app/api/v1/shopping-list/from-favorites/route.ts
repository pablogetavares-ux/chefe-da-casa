import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { shoppingListQuerySchema } from "@/lib/validations";
import { addMissingFromFavoriteRecipes } from "@/modules/shopping/services/favorites-bridge";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json().catch(() => ({}));
    const parsed = shoppingListQuerySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const result = await addMissingFromFavoriteRecipes(
      supabase,
      user.id,
      parsed.data.listId,
    );

    return apiSuccess(result, result.added > 0 ? 201 : 200);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/shopping-list/from-favorites",
      "Erro ao importar favoritos",
    );
  }
}
