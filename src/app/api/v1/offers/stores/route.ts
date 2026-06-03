import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchActiveRegionalStores } from "@/modules/offers/services/region";

/** Catálogo de mercados ativos (preparado para parceiros / expansão). */
export async function GET() {
  try {
    await requireAuthUser();
    const supabase = await createClient();
    const stores = await fetchActiveRegionalStores(supabase);
    return apiSuccess({ stores });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/stores",
      "Erro ao listar mercados",
    );
  }
}
