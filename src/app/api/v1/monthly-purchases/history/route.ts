import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { createMonthlyPurchasesService } from "@/modules/monthly-purchases/services/monthly-purchases.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const supabase = await createClient();
    const service = createMonthlyPurchasesService(supabase);
    const data = await service.listHistory(user.id);

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/monthly-purchases/history",
      "Erro ao carregar histórico",
    );
  }
}
