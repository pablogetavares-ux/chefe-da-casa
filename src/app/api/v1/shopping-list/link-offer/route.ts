import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { shoppingLinkOfferSchema } from "@/lib/validations";
import { linkOfferToShoppingItem } from "@/modules/shopping/services/shopping-list";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = shoppingLinkOfferSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const item = await linkOfferToShoppingItem(
      supabase,
      user.id,
      parsed.data.itemId,
      parsed.data.offerId,
    );

    return apiSuccess(item);
  } catch (error) {
    if (error instanceof Error && error.message.includes("não encontrad")) {
      return apiError("Recurso não encontrado", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/shopping-list/link-offer",
      "Erro ao vincular oferta",
    );
  }
}
