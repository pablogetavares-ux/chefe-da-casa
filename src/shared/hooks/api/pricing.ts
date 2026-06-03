"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { CompareItemInput } from "@/modules/pricing/types";
import { pricingCompareQueryKey } from "@/shared/hooks/api/query-keys";

export type PricingCompareMode = "list" | "basket" | "custom";

export type PricingCompareFilters = {
  city: string;
  mode: PricingCompareMode;
  listId?: string;
  customItems?: CompareItemInput[];
};

export function usePriceComparison(filters: PricingCompareFilters) {
  const enabled = Boolean(filters.city) && filters.city.length >= 2;

  return useQuery({
    queryKey: pricingCompareQueryKey({
      mode: filters.mode,
      city: filters.city,
      listId: filters.listId,
      customItemsKey:
        filters.customItems?.map((item) => item.name).join("|") ?? "",
    }),
    queryFn: async () => {
      if (filters.mode === "basket") {
        return api.pricing.compareBasket(filters.city);
      }
      if (filters.mode === "custom" && filters.customItems?.length) {
        return api.pricing.compareCustom({
          city: filters.city,
          items: filters.customItems,
        });
      }
      return api.pricing.compareList({
        city: filters.city,
        listId: filters.listId,
      });
    },
    enabled,
    staleTime: 60_000,
  });
}
