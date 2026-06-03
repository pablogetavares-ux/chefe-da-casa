import { assertPremiumFeature } from "@/lib/billing/assert-premium";
import { apiError } from "@/lib/api/response";
import { handleApiRouteErrorWithPlanLimit } from "@/lib/api/route-error";
import { apiSuccess } from "@/lib/api/plan-errors";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import {
  pricingCompareBodySchema,
  pricingCompareQuerySchema,
} from "@/lib/validations";
import {
  compareBasicBasketPrices,
  compareCustomItemsPrices,
  compareShoppingListPrices,
} from "@/modules/pricing/services/pricing";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser();
    await assertPremiumFeature(user.id, "Comparador de preços");
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = pricingCompareQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data =
      parsed.data.mode === "basket"
        ? await compareBasicBasketPrices(supabase, user.id, parsed.data.city)
        : await compareShoppingListPrices(supabase, user.id, {
            city: parsed.data.city,
            listId: parsed.data.listId,
          });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(
      error,
      "GET /api/v1/pricing/compare",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    await assertPremiumFeature(user.id, "Comparador de preços");
    const body = await request.json();
    const parsed = pricingCompareBodySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await compareCustomItemsPrices(supabase, user.id, {
      city: parsed.data.city,
      items: parsed.data.items,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(
      error,
      "POST /api/v1/pricing/compare",
    );
  }
}
