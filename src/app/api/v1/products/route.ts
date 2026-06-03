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
import {
  productCreateSchema,
  productListQuerySchema,
} from "@/lib/validations/products";
import {
  listProducts,
  createProduct,
} from "@/modules/products-prices/services/products";

export async function GET(request: Request) {
  try {
    await requireAuthUser(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = productListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const products = await listProducts(supabase, parsed.data);

    return apiSuccess({ products });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/products",
      "Erro ao listar produtos",
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser(request);

    if (!isAdminClientConfigured()) {
      return apiError(
        "Catálogo indisponível para escrita",
        503,
        "SERVICE_NOT_CONFIGURED",
      );
    }

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const admin = createAdminClient();
    const product = await createProduct(admin, parsed.data);

    return apiSuccess({ product }, 201);
  } catch (error) {
    if (isAdminRequiredError(error)) {
      return adminForbiddenResponse();
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/products",
      "Erro ao criar produto",
    );
  }
}
