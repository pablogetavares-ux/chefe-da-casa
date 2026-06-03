"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { MarketsCompareBodyInput } from "@/lib/validations/markets";
import { marketsCompareQueryKey } from "@/shared/hooks/api/query-keys";

export function useMarketsCompare(listId?: string, enabled = true) {
  return useQuery({
    queryKey: marketsCompareQueryKey(listId),
    queryFn: () => api.markets.compare(listId),
    enabled: enabled && Boolean(listId),
    staleTime: 60_000,
  });
}

export function useMarketsCompareMutation() {
  return useMutation({
    mutationFn: (body: MarketsCompareBodyInput) =>
      api.markets.comparePost(body),
  });
}
