"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { PantryItemUpdateInput } from "@/lib/validations";
import {
  invalidateKeys,
  PANTRY_INVALIDATION,
  RECIPE_AI_INVALIDATION,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";

export function usePantryItems(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["pantry"],
    queryFn: api.pantry.list,
    enabled: options?.enabled ?? true,
  });
}

export function useCreatePantryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.pantry.create,
    onSuccess: () => {
      invalidateKeys(queryClient, PANTRY_INVALIDATION);
      toastMutationSuccess("Ingrediente adicionado à despensa");
    },
    onError: toastMutationError,
  });
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PantryItemUpdateInput }) =>
      api.pantry.update(id, data),
    onSuccess: () => {
      invalidateKeys(queryClient, PANTRY_INVALIDATION);
      toastMutationSuccess("Despensa atualizada");
    },
    onError: toastMutationError,
  });
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.pantry.delete,
    onSuccess: () => {
      invalidateKeys(queryClient, PANTRY_INVALIDATION);
      toastMutationSuccess("Ingrediente removido");
    },
    onError: toastMutationError,
  });
}

export function useAntiWasteSummary() {
  return useQuery({
    queryKey: ["anti-waste-summary"],
    queryFn: api.antiWaste.summary,
    staleTime: 60_000,
  });
}

export function useGenerateAntiWasteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.antiWaste,
    onSuccess: () => {
      invalidateKeys(queryClient, [
        ...RECIPE_AI_INVALIDATION,
        ["anti-waste-summary"],
      ]);
    },
    onError: toastMutationError,
  });
}
