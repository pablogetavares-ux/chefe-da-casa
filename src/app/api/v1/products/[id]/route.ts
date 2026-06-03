import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import {
  adminForbiddenResponse,
  isAdminRequiredError,
  requireAdminUser,
} from "@/lib/api/admin-auth";
import { requireAuthUser } from "@/lib/api/auth";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { productUpdateSchema } from "@/lib/validations/products";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/modules/products-prices/services/products";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAuthUser();
    const { id } = await params;
    const supabase = await createClient();
    const product = await getProductById(supabase, id);

    if (!product) {
      return apiError("Produto não encontrado", 404, "NOT_FOUND");
    }

    return apiSuccess({ product });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/products/:id",
      "Erro ao buscar produto",
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser(request);
    const { id } = await params;

    if (!isAdminClientConfigured()) {
      return apiError("Catálogo indisponível para escrita", 503);
    }

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const admin = createAdminClient();
    const product = await updateProduct(admin, id, parsed.data);

    return apiSuccess({ product });
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return adminForbiddenResponse();
    }
    return handleApiRouteError(
      error,
      "PATCH /api/v1/products/:id",
      "Erro ao atualizar produto",
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
    await deleteProduct(admin, id);

    return apiSuccess({ deleted: true });
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return adminForbiddenResponse();
    }
    return handleApiRouteError(
      error,
      "DELETE /api/v1/products/:id",
      "Erro ao excluir produto",
    );
  }
}
