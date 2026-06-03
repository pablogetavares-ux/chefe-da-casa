"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import {
  invalidateKeys,
  RECIPE_INVALIDATION,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";

export function useRecipes() {
  const query = useInfiniteQuery({
    queryKey: ["recipes"],
    queryFn: ({ pageParam }) =>
      api.recipes.list({ page: pageParam, limit: 50 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
  });

  const recipes = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    recipes,
    isLoading: query.isLoading,
    error: query.error,
    hasMore: query.hasNextPage ?? false,
    loadMore: () => query.fetchNextPage(),
    isLoadingMore: query.isFetchingNextPage,
    pagination: query.data?.pages.at(-1)?.pagination,
  };
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.recipes.delete,
    onSuccess: () => {
      invalidateKeys(queryClient, RECIPE_INVALIDATION);
      toastMutationSuccess("Receita excluída");
    },
    onError: toastMutationError,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: api.favorites.list,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeId,
      isFavorite,
    }: {
      recipeId: string;
      isFavorite: boolean;
    }) => {
      if (isFavorite) {
        return api.favorites.remove(recipeId);
      }
      return api.favorites.add(recipeId);
    },
    onSuccess: (_data, variables) => {
      invalidateKeys(queryClient, RECIPE_INVALIDATION);
      toastMutationSuccess(
        variables.isFavorite
          ? "Removido dos favoritos"
          : "Adicionado aos favoritos",
      );
    },
    onError: toastMutationError,
  });
}
