import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerListQuerySchema } from "@/lib/validations";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import {
  fetchUserFavoriteOfferIds,
  queryRegionalOffers,
} from "@/modules/offers/services/offers";
import {
  fetchOfferStoreCatalog,
  getUserOfferRegion,
} from "@/modules/offers/services/region";
import { Constants } from "@/types/database";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = offerListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Filtros inválidos",
        400,
      );
    }

    const supabase = await createClient();
    const profileRegion = await getUserOfferRegion(supabase, user.id);

    const region = buildUserOfferRegion({
      city: parsed.data.city ?? profileRegion.city,
      state: parsed.data.state ?? profileRegion.state,
      radiusKm: parsed.data.radiusKm ?? profileRegion.radiusKm,
    });

    const scope = parsed.data.scope ?? "within_radius";

    const useLegacyCityOnly =
      Boolean(parsed.data.city) &&
      !parsed.data.radiusKm &&
      !parsed.data.state &&
      !parsed.data.scope;

    const catalog = await fetchOfferStoreCatalog(supabase);

    const [offers, favoriteIds] = await Promise.all([
      queryRegionalOffers(supabase, {
        userId: user.id,
        region: useLegacyCityOnly ? null : region,
        scope: useLegacyCityOnly ? undefined : scope,
        city: useLegacyCityOnly ? parsed.data.city : null,
        category: parsed.data.category,
        q: parsed.data.q,
        favoritesOnly: parsed.data.favoritesOnly,
        stores: catalog.stores,
      }),
      fetchUserFavoriteOfferIds(supabase, user.id),
    ]);

    const { cities, regionCities } = catalog;

    return apiSuccess({
      offers,
      cities,
      regionCities,
      categories: Constants.public.Enums.OfferCategory,
      favoriteIds: [...favoriteIds],
      region,
      filters: {
        city: region.city,
        state: region.state,
        radiusKm: region.radiusKm,
        scope,
        category: parsed.data.category ?? null,
        q: parsed.data.q ?? null,
      },
    });
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers",
      "Erro ao carregar ofertas",
    );
  }
}
