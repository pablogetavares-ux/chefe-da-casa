"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PlanId } from "@/config/plans";
import { api, type PlanUsageSummary } from "@/lib/api/client";
import { isPremiumTier } from "@/lib/billing/premium";
import {
  invalidateKeys,
  toastMutationError,
  toastMutationSuccess,
} from "@/shared/hooks/api/mutation-utils";
import { OFFERS_FULL_INVALIDATION } from "@/shared/hooks/api/query-keys";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: api.profile.get,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.profile.update,
    onSuccess: () => {
      invalidateKeys(queryClient, [
        ["profile"],
        ["billing"],
        ["plan-usage"],
        ...OFFERS_FULL_INVALIDATION,
      ]);
      toastMutationSuccess("Perfil atualizado");
    },
    onError: toastMutationError,
  });
}

export function useExportMyData() {
  return useMutation({
    mutationFn: api.profile.exportData,
    onSuccess: () => toastMutationSuccess("Download iniciado"),
    onError: toastMutationError,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: api.profile.deleteAccount,
    onError: toastMutationError,
  });
}

export function useBillingSubscription() {
  return useQuery({
    queryKey: ["billing"],
    queryFn: api.billing.subscription,
  });
}

export function usePlanUsage() {
  return useQuery({
    queryKey: ["plan-usage"],
    queryFn: api.billing.planUsage,
    staleTime: 60_000,
  });
}

export function usePremiumAccess() {
  const query = usePlanUsage();
  const plan = query.data?.plan ?? "FREE";

  return {
    ...query,
    plan,
    isPremium: isPremiumTier(plan),
    isLoading: query.isLoading,
  };
}

export type { PlanUsageSummary };

export function useBillingCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: PlanId) => api.billing.checkout(planId),
    onSuccess: (data) => {
      if (data.mock) {
        invalidateKeys(queryClient, [
          ["billing"],
          ["plan-usage"],
          ["profile"],
          ["ai-usage"],
        ]);
      }
      window.location.href = data.url;
    },
    onError: toastMutationError,
  });
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: api.billing.portal,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: toastMutationError,
  });
}

export { useAdminStats } from "@/shared/hooks/api/admin";
