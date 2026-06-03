import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import {
  substitutionsBodySchema,
  substitutionsQuerySchema,
} from "@/lib/validations/substitutions";
import {
  computeIntelligentSubstitutions,
  RecipeNotFoundError,
} from "@/modules/substitutions/services/substitutions";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = substitutionsQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();

    if (parsed.data.catalogOnly) {
      const data = await computeIntelligentSubstitutions(supabase, {
        userId: user.id,
        includeCatalog: true,
        ingredients: [],
      });
      return apiSuccess({
        catalog: data.catalog,
        suggestions: [],
        estimatedTotalSavings: 0,
      });
    }

    if (!parsed.data.recipeId) {
      return apiError("Informe recipeId ou catalogOnly=true", 400);
    }

    const data = await computeIntelligentSubstitutions(supabase, {
      userId: user.id,
      recipeId: parsed.data.recipeId,
      marketName: parsed.data.marketName,
      applySubstitutions: parsed.data.applySubstitutions ?? false,
    });

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof RecipeNotFoundError) {
      return apiError("Receita não encontrada", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "GET /api/v1/substitutions",
      "Erro nas substituições",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = substitutionsBodySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();

    if (parsed.data.catalogOnly) {
      const data = await computeIntelligentSubstitutions(supabase, {
        userId: user.id,
        includeCatalog: true,
        ingredients: [],
      });
      return apiSuccess({
        catalog: data.catalog,
        suggestions: [],
        estimatedTotalSavings: 0,
      });
    }

    const data = await computeIntelligentSubstitutions(supabase, {
      userId: user.id,
      recipeId: parsed.data.recipeId,
      title: parsed.data.title,
      ingredients: parsed.data.ingredients,
      marketName: parsed.data.marketName,
      applySubstitutions: parsed.data.applySubstitutions ?? true,
    });

    return apiSuccess(data);
  } catch (error) {
    if (error instanceof RecipeNotFoundError) {
      return apiError("Receita não encontrada", 404, "NOT_FOUND");
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/substitutions",
      "Erro nas substituições",
    );
  }
}
