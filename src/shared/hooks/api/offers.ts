"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import type { OfferCategory } from "@/modules/offers/types";
import type { OfferRegionScope } from "@/modules/offers/region/types";
import type { OfferSearchRadiusKm } from "@/modules/offers/region/types";
import {
  invalidateKeys,
  OFFERS_INVALIDATION,
  OFFERS_SHOPPING_INVALIDATION,
  HOME_FEED_INVALIDATION,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";
import {
  OFFERS_FOR_RECIPE_QUERY_PREFIX,
  OFFERS_QUERY_PREFIX,
  OFFERS_REGION_QUERY_KEY,
} from "@/shared/hooks/api/query-keys";

export type OffersFilters = {
  city?: string;
  state?: string;
  radiusKm?: OfferSearchRadiusKm;
  scope?: OfferRegionScope;
  category?: OfferCategory | null;
  q?: string;
  favoritesOnly?: boolean;
};

function offersQueryKey(filters: OffersFilters) {
  return [
    OFFERS_QUERY_PREFIX,
    filters.city ?? "all-cities",
    filters.state ?? "all-states",
    filters.radiusKm ?? 300,
    filters.scope ?? "within_radius",
    filters.category ?? "all-categories",
    filters.q ?? "",
    filters.favoritesOnly ? "favorites" : "all",
  ] as const;
}

export function useOffers(filters: OffersFilters = {}) {
  return useQuery({
    queryKey: offersQueryKey(filters),
    queryFn: () =>
      api.offers.list({
        city: filters.city,
        state: filters.state,
        radiusKm: filters.radiusKm,
        scope: filters.scope,
        category: filters.category ?? undefined,
        q: filters.q,
        favoritesOnly: filters.favoritesOnly,
      }),
    staleTime: 60_000,
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

export function useOffersForRecipe(
  recipeId?: string,
  options?: {
    city?: string;
    state?: string;
    radiusKm?: OfferSearchRadiusKm;
    scope?: OfferRegionScope;
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
    enabled: Boolean(recipeId),
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
