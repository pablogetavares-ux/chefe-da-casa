"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import type { OfferRegionScope } from "@/modules/offers/region/types";
import type { OfferSearchRadiusKm } from "@/modules/offers/region/types";
import type {
  OfferSearchScope,
  OfferSortBy,
} from "@/modules/offers/utils/search";
import {
  invalidateKeys,
  OFFERS_INVALIDATION,
  OFFERS_SHOPPING_INVALIDATION,
  HOME_FEED_INVALIDATION,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";
import {
  OFFERS_FOR_ANTI_WASTE_QUERY_KEY,
  OFFERS_FOR_INGREDIENTS_QUERY_PREFIX,
  OFFERS_FOR_PANTRY_QUERY_KEY,
  OFFERS_FOR_RECIPE_QUERY_PREFIX,
  OFFERS_HUB_QUERY_KEY,
  OFFERS_INTEGRATION_CONTEXT_QUERY_KEY,
  OFFERS_QUERY_PREFIX,
  OFFERS_REGION_QUERY_KEY,
} from "@/shared/hooks/api/query-keys";

export type OffersFilters = {
  city?: string;
  state?: string;
  radiusKm?: OfferSearchRadiusKm;
  scope?: OfferRegionScope;
  verticalSlug?: string;
  categorySlug?: string | null;
  q?: string;
  searchScope?: OfferSearchScope;
  sortBy?: OfferSortBy;
  favoritesOnly?: boolean;
};

function offersQueryKey(filters: OffersFilters) {
  return [
    OFFERS_QUERY_PREFIX,
    filters.city ?? "all-cities",
    filters.state ?? "all-states",
    filters.radiusKm ?? 300,
    filters.scope ?? "within_radius",
    filters.verticalSlug ?? DEFAULT_OFFER_VERTICAL_SLUG,
    filters.categorySlug ?? "all-categories",
    filters.q ?? "",
    filters.searchScope ?? "all",
    filters.sortBy ?? "relevance",
    filters.favoritesOnly ? "favorites" : "all",
  ] as const;
}

export function useOffersHub() {
  return useQuery({
    queryKey: OFFERS_HUB_QUERY_KEY,
    queryFn: () => api.offers.getHub(),
    staleTime: 300_000,
  });
}

export function useOffers(
  filters: OffersFilters = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: offersQueryKey(filters),
    queryFn: () =>
      api.offers.list({
        city: filters.city,
        state: filters.state,
        radiusKm: filters.radiusKm,
        scope: filters.scope,
        verticalSlug: filters.verticalSlug,
        categorySlug: filters.categorySlug ?? undefined,
        q: filters.q,
        searchScope: filters.searchScope,
        sortBy: filters.sortBy,
        favoritesOnly: filters.favoritesOnly,
      }),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
    enabled: options?.enabled ?? true,
  });
}

export function useOfferRegionConfig(enabled = true) {
  return useQuery({
    queryKey: OFFERS_REGION_QUERY_KEY,
    queryFn: () => api.offers.getRegion(),
    staleTime: 120_000,
    enabled,
  });
}

export function useUpdateOfferRegion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      city: string;
      state: string;
      radiusKm: OfferSearchRadiusKm;
    }) => api.offers.updateRegion(body),
    onSuccess: () => {
      invalidateKeys(queryClient, [
        ...OFFERS_INVALIDATION,
        ...HOME_FEED_INVALIDATION,
        OFFERS_REGION_QUERY_KEY,
      ]);
      toastMutationSuccess("Região de ofertas atualizada");
    },
    onError: toastMutationError,
  });
}

export function useOffersIntegrationContext() {
  return useQuery({
    queryKey: OFFERS_INTEGRATION_CONTEXT_QUERY_KEY,
    queryFn: () => api.offers.getIntegrationContext(),
    staleTime: 120_000,
  });
}

export function useOffersForAntiWaste(options?: {
  city?: string;
  state?: string;
  radiusKm?: OfferSearchRadiusKm;
}) {
  return useQuery({
    queryKey: [
      ...OFFERS_FOR_ANTI_WASTE_QUERY_KEY,
      options?.city ?? "all",
      options?.state ?? "all-states",
      options?.radiusKm ?? 300,
    ] as const,
    queryFn: () => api.offers.forAntiWaste(options),
    staleTime: 60_000,
  });
}

export function useOffersForIngredients(
  names: string[],
  options?: {
    context?: "weekly_plan" | "ingredients";
    city?: string;
    state?: string;
    radiusKm?: OfferSearchRadiusKm;
    enabled?: boolean;
  },
) {
  const normalized = names
    .map((name) => name.trim())
    .filter(Boolean)
    .sort()
    .join("|");

  return useQuery({
    queryKey: [
      ...OFFERS_FOR_INGREDIENTS_QUERY_PREFIX,
      normalized || "empty",
      options?.context ?? "ingredients",
      options?.city ?? "all",
      options?.state ?? "all-states",
      options?.radiusKm ?? 300,
    ] as const,
    queryFn: () =>
      api.offers.forIngredients({
        names,
        context: options?.context,
        city: options?.city,
        state: options?.state,
        radiusKm: options?.radiusKm,
      }),
    enabled: (options?.enabled ?? true) && names.length > 0,
    staleTime: 60_000,
  });
}

export function useOffersForPantry(options?: {
  city?: string;
  state?: string;
  radiusKm?: OfferSearchRadiusKm;
}) {
  return useQuery({
    queryKey: [
      ...OFFERS_FOR_PANTRY_QUERY_KEY,
      options?.city ?? "all",
      options?.state ?? "all-states",
      options?.radiusKm ?? 300,
    ] as const,
    queryFn: () => api.offers.forPantry(options),
    staleTime: 60_000,
  });
}

export function useOffersForRecipe(
  recipeId?: string,
  options?: {
    city?: string;
    state?: string;
    radiusKm?: OfferSearchRadiusKm;
    scope?: OfferRegionScope;
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: [
      OFFERS_FOR_RECIPE_QUERY_PREFIX,
      recipeId,
      options?.city ?? "all",
      options?.state ?? "all-states",
      options?.radiusKm ?? 300,
      options?.scope ?? "within_radius",
    ] as const,
    queryFn: () => api.offers.forRecipe(recipeId!, options),
    enabled: (options?.enabled ?? true) && Boolean(recipeId),
    staleTime: 60_000,
  });
}

export function useToggleOfferFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      isFavorite,
    }: {
      offerId: string;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        return api.offers.removeFavorite(offerId);
      }
      return api.offers.addFavorite(offerId);
    },
    onSuccess: (_data, variables) => {
      invalidateKeys(queryClient, [
        ...OFFERS_INVALIDATION,
        ...HOME_FEED_INVALIDATION,
      ]);
      toastMutationSuccess(
        variables.isFavorite
          ? "Removido dos favoritos"
          : "Oferta salva nos favoritos",
      );
    },
    onError: toastMutationError,
  });
}

export function useAddOfferToShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => api.offers.addToShopping(offerId),
    onSuccess: (data) => {
      invalidateKeys(queryClient, OFFERS_SHOPPING_INVALIDATION);
      if (data.added) {
        toastMutationSuccess(data.message ?? "Adicionado à lista de compras");
      } else {
        toast.info(data.message ?? "Item já estava na lista");
      }
    },
    onError: toastMutationError,
  });
}
