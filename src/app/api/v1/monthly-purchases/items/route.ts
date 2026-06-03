import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { monthPurchaseItemCreateSchema } from "@/lib/validations/monthly-purchases";
import { createMonthlyPurchasesService } from "@/modules/monthly-purchases/services/monthly-purchases.service";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = monthPurchaseItemCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const service = createMonthlyPurchasesService(supabase);
    const data = await service.addItem(user.id, parsed.data);

    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/monthly-purchases/items",
      "Erro ao adicionar item",
    );
  }
}
