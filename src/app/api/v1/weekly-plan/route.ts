import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import {
  weeklyPlanBodySchema,
  weeklyPlanQuerySchema,
} from "@/lib/validations/weekly-plan";
import { buildWeeklyMealPlan } from "@/modules/weekly-plan/services/weekly-plan";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = weeklyPlanQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await buildWeeklyMealPlan(supabase, user.id, {
      goal: parsed.data.goal,
      startsOn: parsed.data.startsOn,
      excludePantry: parsed.data.excludePantry,
      persist: parsed.data.persist ?? false,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/weekly-plan",
      "Erro ao gerar plano semanal",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = weeklyPlanBodySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await buildWeeklyMealPlan(supabase, user.id, {
      goal: parsed.data.goal,
      startsOn: parsed.data.startsOn,
      excludePantry: parsed.data.excludePantry,
      persist: parsed.data.persist ?? false,
    });

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "POST /api/v1/weekly-plan",
      "Erro ao gerar plano semanal",
    );
  }
}
