import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerRegionUpdateSchema } from "@/lib/validations";
import {
  getOfferRegionConfig,
  saveUserOfferRegion,
} from "@/modules/offers/services/region";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const config = await getOfferRegionConfig(supabase, user.id);
    return apiSuccess(config);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/region",
      "Erro ao carregar região",
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = offerRegionUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const config = await saveUserOfferRegion(supabase, user.id, parsed.data);

    return apiSuccess(config);
  } catch (error) {
    return handleApiRouteError(
      error,
      "PUT /api/v1/offers/region",
      "Erro ao salvar região",
    );
  }
}
