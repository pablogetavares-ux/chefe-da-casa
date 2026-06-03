import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import {
  shoppingListGenerateSchema,
  shoppingListQuerySchema,
} from "@/lib/validations";
import {
  generateShoppingListFromRecipes,
  RecipeIdsNotFoundError,
} from "@/modules/shopping/services/from-recipes";
import { buildSmartShoppingResponse } from "@/modules/shopping/services/shopping-list";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const parsed = shoppingListQuerySchema.safeParse({
      listId: searchParams.get("listId") ?? undefined,
    });

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const data = await buildSmartShoppingResponse(
      supabase,
      user.id,
      parsed.data.listId,
    );

    return apiSuccess(data);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/shopping-list",
      "Erro ao carregar lista",
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const body = await request.json();
    const parsed = shoppingListGenerateSchema.safeParse(body);

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
    const data = await generateShoppingListFromRecipes(supabase, user.id, {
      recipeIds: parsed.data.recipeIds,
      listId: parsed.data.listId,
      excludePantry: parsed.data.excludePantry,
      persist: parsed.data.persist,
    });

    return apiSuccess(data, parsed.data.persist ? 201 : 200);
  } catch (error) {
    if (error instanceof RecipeIdsNotFoundError) {
      return apiError(
        "Uma ou mais receitas não foram encontradas",
        404,
        "NOT_FOUND",
      );
    }
    return handleApiRouteError(
      error,
      "POST /api/v1/shopping-list",
      "Erro ao gerar lista de compras",
    );
  }
}
