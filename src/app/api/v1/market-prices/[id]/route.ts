import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import {
  adminForbiddenResponse,
  isAdminRequiredError,
  requireAdminUser,
} from "@/lib/api/admin-auth";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";
import { marketPriceUpdateSchema } from "@/lib/validations/products";
import {
  deleteMarketPrice,
  getMarketPriceById,
  updateMarketPrice,
} from "@/modules/products-prices/services/market-prices";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser(request);
    const { id } = await params;

    if (!isAdminClientConfigured()) {
      return apiError("Catálogo indisponível para escrita", 503);
    }

    const body = await request.json();
    const parsed = marketPriceUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const admin = createAdminClient();
    const existing = await getMarketPriceById(admin, id);
    if (!existing) {
      return apiError("Preço não encontrado", 404, "NOT_FOUND");
    }

    const price = await updateMarketPrice(admin, id, parsed.data);
    return apiSuccess({ price });
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return adminForbiddenResponse();
    }
    return handleApiRouteError(
      error,
      "PATCH /api/v1/market-prices/:id",
      "Erro ao atualizar preço",
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser();
    const { id } = await params;

    if (!isAdminClientConfigured()) {
      return apiError("Catálogo indisponível para escrita", 503);
    }

    const admin = createAdminClient();
    await deleteMarketPrice(admin, id);

    return apiSuccess({ deleted: true });
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return adminForbiddenResponse();
    }
    return handleApiRouteError(
      error,
      "DELETE /api/v1/market-prices/:id",
      "Erro ao excluir preço",
    );
  }
}
