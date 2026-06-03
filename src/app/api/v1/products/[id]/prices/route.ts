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
import { marketPriceCreateSchema } from "@/lib/validations/products";
import { getProductById } from "@/modules/products-prices/services/products";
import {
  createMarketPrice,
  listPricesForProduct,
} from "@/modules/products-prices/services/market-prices";

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

    const prices = await listPricesForProduct(supabase, id);
    return apiSuccess({ productId: id, prices });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/products/:id/prices",
      "Erro ao listar preços",
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await requireAdminUser(request);
    const { id } = await params;

    if (!isAdminClientConfigured()) {
      return apiError("Catálogo indisponível para escrita", 503);
    }

    const body = await request.json();
    const parsed = marketPriceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const admin = createAdminClient();
    const product = await getProductById(admin, id);
    if (!product) {
      return apiError("Produto não encontrado", 404, "NOT_FOUND");
    }

    const price = await createMarketPrice(admin, id, parsed.data);
    return apiSuccess({ price }, 201);
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return adminForbiddenResponse();
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/products/:id/prices",
      "Erro ao registrar preço",
    );
  }
}
