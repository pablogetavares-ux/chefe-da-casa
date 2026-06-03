import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { monthCopyFromSchema } from "@/lib/validations/monthly-purchases";
import { createMonthlyPurchasesService } from "@/modules/monthly-purchases/services/monthly-purchases.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json().catch(() => ({}));
    const parsed = monthCopyFromSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const service = createMonthlyPurchasesService(supabase);
    const { month, year, sourceMonth, sourceYear } = parsed.data;
    const data = await service.copyFromMonth(
      user.id,
      { month, year },
      { month: sourceMonth, year: sourceYear },
    );

    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/monthly-purchases/copy-from-previous",
      "Erro ao copiar lista do mês selecionado",
    );
  }
}
