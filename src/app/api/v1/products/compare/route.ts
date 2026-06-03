import { apiError } from "@/lib/api/response";
import { handleApiRouteErrorWithPlanLimit } from "@/lib/api/route-error";
import { assertPremiumFeature } from "@/lib/billing/assert-premium";
import { apiSuccess } from "@/lib/api/plan-errors";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { productsCompareQuerySchema } from "@/lib/validations/products";
import { buildProductsPriceComparison } from "@/modules/products-prices/services/compare";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    await assertPremiumFeature(user.id, "Comparador de produtos");

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = productsCompareQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await buildProductsPriceComparison(supabase, parsed.data);

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(
      error,
      "GET /api/v1/products/compare",
    );
  }
}
