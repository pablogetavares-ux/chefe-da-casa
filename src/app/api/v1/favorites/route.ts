import { throwIfSupabaseError } from "@/lib/api/supabase-errors";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  handleApiRouteError,
  handleApiRouteErrorWithPlanLimit,
} from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { assertFavoritesLimit } from "@/lib/billing/plan-limits";
import { createClient } from "@/lib/supabase/server";
import { favoriteSchema } from "@/lib/validations";
import type { Recipe } from "@/types/database";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("favorites")
      .select("recipe_id, recipes(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    throwIfSupabaseError(error);

    const recipes = (data ?? [])
      .map((row) => row.recipes)
      .filter((recipe): recipe is Recipe => recipe !== null);

    const recipeIds = (data ?? []).map((row) => row.recipe_id);

    return apiSuccess({ recipes, recipeIds });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/favorites");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();
    const parsed = favoriteSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const supabase = await createClient();

    const { data: recipe } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", parsed.data.recipeId)
      .eq("user_id", user.id)
      .single();

    if (!recipe) {
      return apiError("Receita não encontrada", 404);
    }

    await assertFavoritesLimit(user.id);

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        recipe_id: parsed.data.recipeId,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return apiError("Receita já está nos favoritos", 409);
      }
      throw error;
    }

    return apiSuccess({ id: data.id, recipeId: parsed.data.recipeId }, 201);
  } catch (error) {
    return handleApiRouteErrorWithPlanLimit(error, "POST /api/v1/favorites");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthUser();
    const recipeId = new URL(request.url).searchParams.get("recipeId");

    if (!recipeId) {
      return apiError("recipeId é obrigatório", 400);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);

    throwIfSupabaseError(error);

    return apiSuccess({ recipeId });
  } catch (error) {
    return handleApiRouteError(error, "DELETE /api/v1/favorites");
  }
}
