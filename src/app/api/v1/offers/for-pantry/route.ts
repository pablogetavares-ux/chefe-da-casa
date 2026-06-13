import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerRegionQuerySchema } from "@/lib/validations";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import { queryOffersForPantryGaps } from "@/modules/offers/services/integrations";
import { getUserOfferRegion } from "@/modules/offers/services/region";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = offerRegionQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError("Parâmetros inválidos", 400, "VALIDATION_ERROR");
    }

    const supabase = await createClient(request);
    const profileRegion = await getUserOfferRegion(supabase, user.id);

    const region = buildUserOfferRegion({
      city: parsed.data.city ?? profileRegion.city,
      state: parsed.data.state ?? profileRegion.state,
      radiusKm: parsed.data.radiusKm ?? profileRegion.radiusKm,
    });

    const data = await queryOffersForPantryGaps(supabase, user.id, { region });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/for-pantry",
      "Erro ao buscar ofertas para a despensa",
    );
  }
}
