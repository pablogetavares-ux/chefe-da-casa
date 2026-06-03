import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { monthPeriodQuerySchema } from "@/lib/validations/monthly-purchases";
import { createMonthlyPurchasesService } from "@/modules/monthly-purchases/services/monthly-purchases.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = monthPeriodQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const service = createMonthlyPurchasesService(supabase);
    const data = await service.getMonthDashboard(user.id, parsed.data);

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/monthly-purchases/dashboard",
      "Erro ao carregar dashboard de compras do mês",
    );
  }
}
