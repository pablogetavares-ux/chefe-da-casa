import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { monthPurchaseItemUpdateSchema } from "@/lib/validations/monthly-purchases";
import {
  createMonthlyPurchasesService,
  ItemNotFoundError,
} from "@/modules/monthly-purchases/services/monthly-purchases.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuthUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = monthPurchaseItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const service = createMonthlyPurchasesService(supabase);
    const data = await service.updateItem(user.id, id, parsed.data);

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof ItemNotFoundError) {
      return apiError("Item não encontrado", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "PATCH /api/v1/monthly-purchases/items/:id",
      "Erro ao atualizar item",
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireAuthUser(request);
    const { id } = await context.params;

    const supabase = await createClient();
    const service = createMonthlyPurchasesService(supabase);
    const data = await service.deleteItem(user.id, id);

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof ItemNotFoundError) {
      return apiError("Item não encontrado", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "DELETE /api/v1/monthly-purchases/items/:id",
      "Erro ao remover item",
    );
  }
}
