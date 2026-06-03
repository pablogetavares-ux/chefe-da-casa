import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import {
  recipeCostBodySchema,
  recipeCostQuerySchema,
} from "@/lib/validations/recipe-cost";
import {
  computeRecipeCostForUser,
  RecipeNotFoundError,
} from "@/modules/recipes/services/recipe-cost";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = recipeCostQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await computeRecipeCostForUser(supabase, {
      userId: user.id,
      recipeId: parsed.data.recipeId,
      includeSubstitutions: parsed.data.includeSubstitutions,
    });

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof RecipeNotFoundError) {
      return apiError("Receita não encontrada", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "GET /api/v1/recipes/cost",
      "Erro ao calcular custo",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = recipeCostBodySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await computeRecipeCostForUser(supabase, {
      userId: user.id,
      recipeId: parsed.data.recipeId,
      title: parsed.data.title,
      servings: parsed.data.servings,
      ingredients: parsed.data.ingredients,
      includeSubstitutions: parsed.data.includeSubstitutions,
    });

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof RecipeNotFoundError) {
      return apiError("Receita não encontrada", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/recipes/cost",
      "Erro ao calcular custo",
    );
  }
}
