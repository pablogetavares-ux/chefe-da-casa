import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerAddToShoppingSchema } from "@/lib/validations";
import { addOfferToShoppingList } from "@/modules/offers/services/shopping-bridge";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = offerAddToShoppingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const result = await addOfferToShoppingList(
      supabase,
      user.id,
      parsed.data.offerId,
      parsed.data.listId,
    );

    return apiSuccess(result, result.added ? 201 : 200);
  } catch (error) {
    if (error instanceof Error && error.message.includes("não encontrada")) {
      return apiError(error.message, 404);
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/offers/add-to-shopping",
      "Erro ao adicionar à lista",
    );
  }
}
