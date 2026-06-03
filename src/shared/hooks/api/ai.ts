"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import { streamGenerateRecipe } from "@/lib/api/ai-stream";
import type { GenerateRecipeRequest } from "@/types";
import {
  invalidateKeys,
  RECIPE_AI_INVALIDATION,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";

export function useAiStatus() {
  return useQuery({
    queryKey: ["ai-status"],
    queryFn: api.ai.status,
    staleTime: 60_000,
  });
}

export function useAiUsage() {
  return useQuery({
    queryKey: ["ai-usage"],
    queryFn: api.ai.usage,
  });
}

export function useAiHistory() {
  return useQuery({
    queryKey: ["ai-history"],
    queryFn: api.ai.history,
  });
}

export function useGenerateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.generate,
    onSuccess: (data) => {
      invalidateKeys(queryClient, RECIPE_AI_INVALIDATION);
      toastMutationSuccess(
        data.cached
          ? "Receita recuperada do cache!"
          : "Receita gerada com sucesso!",
      );
    },
    onError: toastMutationError,
  });
}

export function useGenerateRecipeStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      onDelta,
      onStart,
    }: {
      payload: GenerateRecipeRequest;
      onDelta?: (text: string) => void;
      onStart?: (generationId: string) => void;
    }) =>
      new Promise<Awaited<ReturnType<typeof api.ai.generate>>>(
        (resolve, reject) => {
          streamGenerateRecipe(payload, {
            onStart: ({ generationId }) => onStart?.(generationId),
            onDelta: ({ text }) => onDelta?.(text),
            onDone: (result) => resolve(result),
            onError: (message) => reject(new Error(message)),
          }).catch(reject);
        },
      ),
    onSuccess: (data) => {
      invalidateKeys(queryClient, RECIPE_AI_INVALIDATION);
      toastMutationSuccess(
        data.cached
          ? "Receita recuperada do cache!"
          : "Receita gerada com sucesso!",
      );
    },
    onError: toastMutationError,
  });
}

export function useAdaptRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.adapt,
    onSuccess: () => {
      invalidateKeys(queryClient, RECIPE_AI_INVALIDATION);
      toastMutationSuccess("Receita adaptada!");
    },
    onError: toastMutationError,
  });
}

export function useRefineRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.refine,
    onSuccess: () => {
      invalidateKeys(queryClient, RECIPE_AI_INVALIDATION);
      toastMutationSuccess("Receita refinada!");
    },
    onError: toastMutationError,
  });
}

export function useRecipeSubstitutions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.substitutions,
    onSuccess: () => {
      invalidateKeys(queryClient, [["ai-usage"], ["ai-history"]]);
      toastMutationSuccess("Substituições sugeridas!");
    },
    onError: toastMutationError,
  });
}

export function useRecipeMacros() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId }: { recipeId: string }) => api.ai.macros(recipeId),
    onSuccess: () => {
      invalidateKeys(queryClient, RECIPE_AI_INVALIDATION);
      toastMutationSuccess("Macros calculados!");
    },
    onError: toastMutationError,
  });
}

export function useScanIngredients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.scanIngredients,
    onSuccess: (data) => {
      invalidateKeys(queryClient, [["ai-usage"], ["ai-history"], ["pantry"]]);
      toastMutationSuccess(
        `${data.ingredientNames.length} ingrediente${data.ingredientNames.length !== 1 ? "s" : ""} detectado${data.ingredientNames.length !== 1 ? "s" : ""}`,
      );
    },
    onError: toastMutationError,
  });
}

export function useUploadScan() {
  return useMutation({
    mutationFn: api.ai.uploadScan,
    onError: toastMutationError,
  });
}

export function useScanAndGenerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.ai.scanAndGenerate,
    onSuccess: (data) => {
      invalidateKeys(queryClient, [...RECIPE_AI_INVALIDATION, ["pantry"]]);
      toastMutationSuccess(
        data.cached
          ? "Receita recuperada do cache!"
          : "Receita gerada a partir da foto!",
      );
    },
    onError: toastMutationError,
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: api.ai.chat,
    onError: toastMutationError,
  });
}
