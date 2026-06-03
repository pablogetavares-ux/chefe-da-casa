import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type {
  MonthPurchaseItemCreateInput,
  MonthPurchaseItemUpdateInput,
} from "@/lib/validations/monthly-purchases";
import type { MonthShoppingListWithItems } from "@/modules/monthly-purchases/types";
import { buildMonthPurchaseInsights } from "@/modules/monthly-purchases/utils/insights";
import {
  MONTHLY_PURCHASES_HISTORY_QUERY_KEY,
  MONTHLY_PURCHASES_QUERY_KEY,
  monthlyPurchasesDashboardQueryKey,
} from "@/shared/hooks/api/query-keys";
import { useAuthQueryEnabled } from "@/shared/hooks/use-auth-query-enabled";

export function monthlyPurchasesQueryKey(
  month: number,
  year: number,
  ensure = false,
) {
  return [...MONTHLY_PURCHASES_QUERY_KEY, month, year, ensure] as const;
}

function patchListData(
  data: MonthShoppingListWithItems,
  updater: (
    items: MonthShoppingListWithItems["items"],
  ) => MonthShoppingListWithItems["items"],
): MonthShoppingListWithItems {
  const items = updater(data.items);
  const insights = buildMonthPurchaseInsights(items);
  return {
    list: data.list,
    items,
    summary: {
      itemCount: insights.itemCount,
      purchasedCount: insights.purchasedCount,
      pendingCount: insights.pendingCount,
      totalSpent: insights.totalSpent,
      spentOnPurchased: insights.spentOnPurchased,
    },
    period: data.period,
  };
}

export function useMonthlyPurchases(
  month: number,
  year: number,
  options?: { ensure?: boolean },
) {
  const enabled = useAuthQueryEnabled();
  const ensure = options?.ensure ?? false;

  return useQuery({
    queryKey: monthlyPurchasesQueryKey(month, year, ensure),
    queryFn: () => api.monthlyPurchases.get(month, year, ensure),
    staleTime: 30_000,
    enabled,
  });
}

export function useMonthlyPurchaseDashboard(
  month: number,
  year: number,
  options?: { enabled?: boolean },
) {
  const authEnabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: monthlyPurchasesDashboardQueryKey(month, year),
    queryFn: () => api.monthlyPurchases.dashboard(month, year),
    staleTime: 30_000,
    enabled: authEnabled && (options?.enabled ?? true),
  });
}

export function useMonthlyCopySuggestion(
  month: number,
  year: number,
  options?: { enabled?: boolean },
) {
  const authEnabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: [
      ...MONTHLY_PURCHASES_QUERY_KEY,
      "copy-suggestion",
      month,
      year,
    ] as const,
    queryFn: () => api.monthlyPurchases.copySuggestion(month, year),
    staleTime: 60_000,
    enabled: authEnabled && (options?.enabled ?? true),
  });
}

export function useMonthlyPurchaseHistory() {
  const enabled = useAuthQueryEnabled();

  return useQuery({
    queryKey: MONTHLY_PURCHASES_HISTORY_QUERY_KEY,
    queryFn: () => api.monthlyPurchases.history(),
    staleTime: 60_000,
    enabled,
  });
}

export function useMonthlyPurchaseMutations(month: number, year: number) {
  const queryClient = useQueryClient();
  const queryKey = monthlyPurchasesQueryKey(month, year, false);
  const ensureKey = monthlyPurchasesQueryKey(month, year, true);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: MONTHLY_PURCHASES_QUERY_KEY });
    queryClient.invalidateQueries({
      queryKey: monthlyPurchasesDashboardQueryKey(month, year),
    });
  };

  const setList = (
    key: typeof queryKey,
    updater: (prev: MonthShoppingListWithItems) => MonthShoppingListWithItems,
  ) => {
    queryClient.setQueryData<MonthShoppingListWithItems>(key, (prev) =>
      prev ? updater(prev) : prev,
    );
  };

  const createList = useMutation({
    mutationFn: () => api.monthlyPurchases.createList(month, year),
    onSuccess: (data) => {
      setList(queryKey, () => data);
      setList(ensureKey, () => data);
    },
    onSettled: invalidate,
  });

  const copyFromMonth = useMutation({
    mutationFn: ({
      sourceMonth,
      sourceYear,
    }: {
      sourceMonth: number;
      sourceYear: number;
    }) =>
      api.monthlyPurchases.copyFromMonth(month, year, sourceMonth, sourceYear),
    onSuccess: (data) => {
      setList(queryKey, () => data);
      setList(ensureKey, () => data);
    },
    onSettled: () => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: MONTHLY_PURCHASES_HISTORY_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...MONTHLY_PURCHASES_QUERY_KEY,
          "copy-suggestion",
          month,
          year,
        ],
      });
    },
  });

  const addItem = useMutation({
    mutationFn: (body: MonthPurchaseItemCreateInput) =>
      api.monthlyPurchases.addItem(body),
    onSuccess: (data) => {
      setList(queryKey, () => data);
      setList(ensureKey, () => data);
    },
    onSettled: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: MonthPurchaseItemUpdateInput;
    }) => api.monthlyPurchases.updateItem(id, body),
    onSuccess: (data) => {
      setList(queryKey, () => data);
      setList(ensureKey, () => data);
    },
    onSettled: invalidate,
  });

  const togglePurchased = useMutation({
    mutationFn: ({ id, is_purchased }: { id: string; is_purchased: boolean }) =>
      api.monthlyPurchases.updateItem(id, { is_purchased }),
    onMutate: async ({ id, is_purchased }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous =
        queryClient.getQueryData<MonthShoppingListWithItems>(queryKey);
      if (previous) {
        setList(queryKey, (data) =>
          patchListData(data, (items) =>
            items.map((item) =>
              item.id === id ? { ...item, is_purchased } : item,
            ),
          ),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => api.monthlyPurchases.deleteItem(id),
    onSuccess: (data) => {
      if (data) {
        setList(queryKey, () => data);
        setList(ensureKey, () => data);
      } else invalidate();
    },
    onSettled: invalidate,
  });

  return {
    createList,
    copyFromMonth,
    /** @deprecated Use copyFromMonth — mantido para compatibilidade com chunks em cache. */
    copyFromPrevious: copyFromMonth,
    addItem,
    updateItem,
    togglePurchased,
    deleteItem,
    invalidate,
  };
}
