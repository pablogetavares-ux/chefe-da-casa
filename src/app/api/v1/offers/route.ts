import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { offerListQuerySchema } from "@/lib/validations";
import { buildUserOfferRegion } from "@/modules/offers/region/user-region";
import {
  DEFAULT_OFFER_VERTICAL_SLUG,
  fetchOfferCatalog,
  filterCatalogByVertical,
  resolveCategoryFromSlug,
} from "@/modules/offers/services/catalog";
import {
  fetchUserFavoriteOfferIds,
  queryRegionalOffersWithMeta,
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
    const verticalSlug =
      parsed.data.verticalSlug ?? DEFAULT_OFFER_VERTICAL_SLUG;

    const useLegacyCityOnly =
      Boolean(parsed.data.city) &&
      !parsed.data.radiusKm &&
      !parsed.data.state &&
      !parsed.data.scope;

    const catalog = await fetchOfferCatalog(supabase);
    const verticalCatalog = filterCatalogByVertical(catalog, verticalSlug);
    const vertical = catalog.verticals.find(
      (item) => item.slug === verticalSlug,
    );

    const resolvedCategory = resolveCategoryFromSlug(
      catalog,
      verticalSlug,
      parsed.data.categorySlug,
    );

    const storeCatalog = await fetchOfferStoreCatalog(supabase, {
      verticalId: vertical?.id,
    });

    const [offersResult, favoriteIds] = await Promise.all([
      queryRegionalOffersWithMeta(supabase, {
        userId: user.id,
        region: useLegacyCityOnly ? null : region,
        scope: useLegacyCityOnly ? undefined : scope,
        city: useLegacyCityOnly ? parsed.data.city : null,
        verticalId: vertical?.id,
        categoryId: resolvedCategory?.id,
        category: resolvedCategory
          ? (resolvedCategory.legacyEnum ?? parsed.data.category)
          : parsed.data.category,
        q: parsed.data.q,
        searchScope: parsed.data.searchScope,
        sortBy: parsed.data.sortBy,
        categoryCatalog: verticalCatalog.categories,
        favoritesOnly: parsed.data.favoritesOnly,
        stores: storeCatalog.stores,
      }),
      fetchUserFavoriteOfferIds(supabase, user.id),
    ]);

    const { cities, regionCities } = storeCatalog;
    const hasSearch = Boolean(parsed.data.q?.trim());
    const { offers, searchExpanded } = offersResult;

    return apiSuccess({
      offers,
      cities,
      regionCities,
      verticals: catalog.verticals,
      categoryCatalog: verticalCatalog.categories,
      categories: Constants.public.Enums.OfferCategory,
      favoriteIds: [...favoriteIds],
      region,
      filters: {
        city: region.city,
        state: region.state,
        radiusKm: region.radiusKm,
        scope,
        verticalSlug,
        categorySlug:
          resolvedCategory?.slug ?? parsed.data.categorySlug ?? null,
        category: resolvedCategory?.legacyEnum ?? parsed.data.category ?? null,
        q: parsed.data.q ?? null,
        searchScope: parsed.data.searchScope,
        sortBy: parsed.data.sortBy,
      },
      meta: {
        total: offers.length,
        hasSearch,
        searchExpanded,
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
