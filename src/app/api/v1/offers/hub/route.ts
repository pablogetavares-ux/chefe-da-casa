import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchOfferHubVerticals } from "@/modules/offers/services/catalog";

export async function GET() {
  try {
    await requireAuthUser();
    const supabase = await createClient();
    const verticals = await fetchOfferHubVerticals(supabase);

    return apiSuccess({ verticals });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/hub",
      "Erro ao carregar central de ofertas",
    );
  }
}
