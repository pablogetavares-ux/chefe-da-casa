"use client";

import { useQuery } from "@tanstack/react-query";

import { api, UnauthorizedError } from "@/lib/api/client";
import { recipeSubstitutionsQueryKey } from "@/shared/hooks/api/query-keys";
import { useAuthQueryEnabled } from "@/shared/hooks/use-auth-query-enabled";

export function useRecipeCatalogSubstitutions(recipeId: string) {
  const enabled = useAuthQueryEnabled(Boolean(recipeId));

  return useQuery({
    queryKey: recipeSubstitutionsQueryKey(recipeId),
    queryFn: () =>
      api.substitutions.forRecipe(recipeId, { applySubstitutions: true }),
    staleTime: 120_000,
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof UnauthorizedError) {
        return failureCount < 1;
      }
      return failureCount < 2;
    },
  });
}
