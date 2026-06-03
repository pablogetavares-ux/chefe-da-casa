"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/api/client";
import {
  invalidateKeys,
  SHOPPING_INVALIDATION,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";
import { useActiveShoppingListId } from "@/modules/shopping/hooks/use-active-shopping-list";
import {
  shoppingListQueryKey,
  useShoppingListRealtime,
} from "@/modules/shopping/hooks/use-shopping-list-realtime";
import { SHOPPING_LISTS_QUERY_KEY } from "@/shared/hooks/api/query-keys";

function invalidateShoppingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  listId?: string,
) {
  invalidateKeys(queryClient, [
    shoppingListQueryKey(listId),
    ...SHOPPING_INVALIDATION,
  ]);
}

export function useShoppingLists() {
  return useQuery({
    queryKey: [SHOPPING_LISTS_QUERY_KEY],
    queryFn: api.shoppingList.getLists,
  });
}

export function useShoppingList(listId?: string) {
  useShoppingListRealtime(listId);

  return useQuery({
    queryKey: shoppingListQueryKey(listId),
    queryFn: () => api.shoppingList.get(listId),
  });
}

export function useSmartShopping() {
  const { data: listsMeta, isLoading: listsLoading } = useShoppingLists();
  const { activeListId, setActiveListId } = useActiveShoppingListId(
    listsMeta?.activeListId,
  );

  const resolvedListId = activeListId ?? listsMeta?.activeListId;
  const shoppingQuery = useShoppingList(resolvedListId);

  return {
    ...shoppingQuery,
    lists: listsMeta?.lists ?? [],
    activeListId: resolvedListId,
    setActiveListId,
    listsLoading,
  };
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();
  const { setActiveListId } = useActiveShoppingListId();

  return useMutation({
    mutationFn: (name: string) => api.shoppingList.createList(name),
    onSuccess: (data) => {
      invalidateShoppingQueries(queryClient);
      setActiveListId(data.id);
      toastMutationSuccess("Nova lista criada");
    },
    onError: toastMutationError,
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.shoppingList.deleteList(id),
    onSuccess: (_data, deletedId) => {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("chef-active-shopping-list");
        if (stored === deletedId) {
          sessionStorage.removeItem("chef-active-shopping-list");
        }
      }
      invalidateShoppingQueries(queryClient);
      toastMutationSuccess("Lista removida");
    },
    onError: toastMutationError,
  });
}

export function useAddShoppingListItem(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; quantity?: number; unit?: string }) =>
      api.shoppingList.addItem({ ...data, listId }),
    onSuccess: () => {
      invalidateShoppingQueries(queryClient, listId);
      toastMutationSuccess("Item adicionado à lista");
    },
    onError: toastMutationError,
  });
}

export function useToggleShoppingListItem(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) =>
      api.shoppingList.updateItem(id, { isChecked }),
    onSuccess: (_data, variables) => {
      invalidateShoppingQueries(queryClient, listId);
      if (variables.isChecked) {
        toastMutationSuccess("Item marcado como comprado");
      }
    },
    onError: toastMutationError,
  });
}

export function useDeleteShoppingListItem(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.shoppingList.deleteItem,
    onSuccess: () => {
      invalidateShoppingQueries(queryClient, listId);
      toastMutationSuccess("Item removido da lista");
    },
    onError: toastMutationError,
  });
}

export function useGenerateShoppingListFromRecipes(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeIds: string[]) =>
      api.shoppingList.generateFromRecipes({
        recipeIds,
        listId,
        excludePantry: true,
        persist: true,
      }),
    onSuccess: (data) => {
      invalidateShoppingQueries(queryClient, listId);
      const parts: string[] = [];
      if (data.added > 0) parts.push(`${data.added} novo(s)`);
      if (data.updated > 0) parts.push(`${data.updated} atualizado(s)`);
      if (parts.length > 0) {
        toastMutationSuccess(
          `Lista gerada: ${parts.join(", ")} (${data.totalLines} itens)`,
        );
      } else {
        toast.info("Nenhum item novo — tudo já está na lista ou na despensa");
      }
    },
    onError: toastMutationError,
  });
}

export function useAddRecipeToShoppingList(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) =>
      api.shoppingList.addFromRecipe(recipeId, listId),
    onSuccess: (data) => {
      invalidateShoppingQueries(queryClient, listId);
      if (data.added > 0) {
        toastMutationSuccess(
          `${data.added} item${data.added !== 1 ? "s" : ""} adicionado${data.added !== 1 ? "s" : ""} à lista`,
        );
      } else if (data.message) {
        toast.info(data.message);
      } else {
        toast.info("Você já tem todos os ingredientes na despensa ou na lista");
      }
    },
    onError: toastMutationError,
  });
}

export function useAddFavoritesToShoppingList(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.shoppingList.addFromFavorites(listId),
    onSuccess: (data) => {
      invalidateShoppingQueries(queryClient, listId);
      if (data.added > 0) {
        toastMutationSuccess(
          `${data.added} ingrediente${data.added !== 1 ? "s" : ""} dos favoritos adicionado${data.added !== 1 ? "s" : ""}`,
        );
      } else {
        toast.info("Nada novo para adicionar dos favoritos");
      }
    },
    onError: toastMutationError,
  });
}

export function useLinkOfferToShoppingItem(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, offerId }: { itemId: string; offerId: string }) =>
      api.shoppingList.linkOffer(itemId, offerId),
    onSuccess: () => {
      invalidateShoppingQueries(queryClient, listId);
      toastMutationSuccess("Oferta vinculada ao item");
    },
    onError: toastMutationError,
  });
}

export function useClearCheckedShoppingItems(listId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.shoppingList.clearChecked(listId),
    onSuccess: (data) => {
      invalidateShoppingQueries(queryClient, listId);
      toastMutationSuccess(
        `${data.removed} item${data.removed !== 1 ? "s" : ""} removido${data.removed !== 1 ? "s" : ""}`,
      );
    },
    onError: toastMutationError,
  });
}
