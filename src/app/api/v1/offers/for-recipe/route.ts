import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerForRecipeQuerySchema } from "@/lib/validations";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import {
  DEFAULT_OFFER_VERTICAL_SLUG,
  fetchOfferCatalog,
} from "@/modules/offers/services/catalog";
import { prioritizeMatchedOffers } from "@/modules/offers/services/integrations";
import {
  queryOffersForRecipe,
  queryRecipeHeroOffers,
} from "@/modules/offers/services/offers";
import {
  fetchOfferStoreCatalog,
  getUserOfferRegion,
} from "@/modules/offers/services/region";
import { fetchUserOfferContext } from "@/modules/offers/services/user-offer-context";
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

    const [storeCatalog, offerCatalog, userContext] = await Promise.all([
      fetchOfferStoreCatalog(supabase),
      fetchOfferCatalog(supabase),
      fetchUserOfferContext(supabase, user.id),
    ]);

    const result = await queryOffersForRecipe(supabase, user.id, recipe, {
      region,
      scope,
      city: parsed.data.city,
      stores: storeCatalog.stores,
    });

    const offers = prioritizeMatchedOffers(result.offers, userContext);
    const supermarketVertical = offerCatalog.verticals.find(
      (item) => item.slug === DEFAULT_OFFER_VERTICAL_SLUG,
    );
    const { heroOffers, heroMode } = await queryRecipeHeroOffers(
      supabase,
      user.id,
      offers,
      {
        region,
        scope,
        stores: storeCatalog.stores,
        verticalId: supermarketVertical?.id,
      },
    );
    const { cities, regionCities } = storeCatalog;

    return apiSuccess({
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      offers,
      heroOffers: prioritizeMatchedOffers(heroOffers, userContext),
      heroMode,
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
      userContext: {
        plan: userContext.plan,
        fitnessGoal: userContext.fitnessGoal,
        seniorMode: userContext.seniorMode,
        priorityCategories: userContext.priorityCategories,
        priorityLabels: userContext.priorityLabels,
        personalizationReason: userContext.personalizationReason,
      },
    });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/for-recipe",
      "Erro ao buscar ofertas",
    );
  }
}
