import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerForRecipeQuerySchema } from "@/lib/validations";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import { queryOffersForRecipe } from "@/modules/offers/services/offers";
import {
  fetchOfferStoreCatalog,
  getUserOfferRegion,
} from "@/modules/offers/services/region";
import { DEFAULT_OFFER_CITY } from "@/modules/offers/types";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = offerForRecipeQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const supabase = await createClient();

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", parsed.data.recipeId)
      .eq("user_id", user.id)
      .single();

    if (error || !recipe) {
      return apiError("Receita não encontrada", 404, "RECIPE_NOT_FOUND");
    }

    const profileRegion = await getUserOfferRegion(supabase, user.id);
    const region = buildUserOfferRegion({
      city: parsed.data.city ?? profileRegion.city,
      state: parsed.data.state ?? profileRegion.state,
      radiusKm: parsed.data.radiusKm ?? profileRegion.radiusKm,
    });
    const scope = parsed.data.scope ?? "within_radius";

    const catalog = await fetchOfferStoreCatalog(supabase);

    const result = await queryOffersForRecipe(supabase, user.id, recipe, {
      region,
      scope,
      city: parsed.data.city,
      stores: catalog.stores,
    });

    const { cities, regionCities } = catalog;

    return apiSuccess({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      offers: result.offers,
      hasIngredientMatches: result.hasIngredientMatches,
      matchScope: result.matchScope,
      city: region.city,
      state: region.state,
      radiusKm: region.radiusKm,
      regionScope: scope,
      cities: cities.length > 0 ? cities : [DEFAULT_OFFER_CITY],
      regionCities,
      ingredientNames: result.ingredientNames,
      alternateCities: result.alternateCities,
    });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/for-recipe",
      "Erro ao buscar ofertas",
    );
  }
}
