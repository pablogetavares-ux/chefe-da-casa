import { apiError } from "@/lib/api/response";
import { handleApiRouteErrorWithPlanLimit } from "@/lib/api/route-error";
import { assertPremiumFeature } from "@/lib/billing/assert-premium";
import { apiSuccess } from "@/lib/api/plan-errors";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import {
  marketsCompareBodySchema,
  marketsCompareQuerySchema,
} from "@/lib/validations/markets";
import { compareMarketsFromShoppingList } from "@/modules/markets/services/compare";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    await assertPremiumFeature(user.id, "Comparador de mercados");

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = marketsCompareQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await compareMarketsFromShoppingList(supabase, user.id, {
      listId: parsed.data.listId,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(
      error,
      "GET /api/v1/markets/compare",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    await assertPremiumFeature(user.id, "Comparador de mercados");

    const body = await request.json();
    const parsed = marketsCompareBodySchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path?.length ? issue.path.join(".") : "";
      const message = issue?.message ?? "Dados inválidos";
      return apiError(
        field ? `${field}: ${message}` : message,
        400,
        "VALIDATION_ERROR",
      );
    }

    const supabase = await createClient();
    const data = await compareMarketsFromShoppingList(supabase, user.id, {
      listId: parsed.data.listId,
      items: parsed.data.items,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(
      error,
      "POST /api/v1/markets/compare",
    );
  }
}
