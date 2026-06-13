import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offersForIngredientsBodySchema } from "@/lib/validations";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import { queryOffersForIngredientNames } from "@/modules/offers/services/integrations";
import { getUserOfferRegion } from "@/modules/offers/services/region";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = offersForIngredientsBodySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const profileRegion = await getUserOfferRegion(supabase, user.id);
    const region = buildUserOfferRegion({
      city: parsed.data.city ?? profileRegion.city,
      state: parsed.data.state ?? profileRegion.state,
      radiusKm: parsed.data.radiusKm ?? profileRegion.radiusKm,
    });

    const data = await queryOffersForIngredientNames(
      supabase,
      user.id,
      parsed.data.names,
      {
        region,
        context: parsed.data.context ?? "ingredients",
      },
    );

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/offers/for-ingredients",
      "Erro ao buscar ofertas para ingredientes",
    );
  }
}
