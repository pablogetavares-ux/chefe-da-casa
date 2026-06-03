import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchMobileBillingStatus, syncMobileBilling } from "@/lib/api";
import { BILLING_ERROR_MESSAGES } from "@/modules/billing/constants";
import {
  configureRevenueCat,
  getCustomerInfo,
  getOfferings,
  hasPremiumEntitlement,
  isTrialEntitlement,
  mapPurchasesError,
  pickPremiumPackage,
  purchasePremiumPackage,
  restorePurchases,
} from "@/modules/billing/services/revenuecat";
import type { BillingError } from "@/modules/billing/types";

export const BILLING_STATUS_KEY = ["mobile-billing-status"];

export function useSubscription(userId: string | undefined) {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: BILLING_STATUS_KEY,
    queryFn: fetchMobileBillingStatus,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: BILLING_STATUS_KEY });
  }, [queryClient]);

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw { code: "UNAUTHORIZED", message: "Login necessário." };
      await configureRevenueCat(userId);
      await getCustomerInfo();
      return syncMobileBilling();
    },
    onSuccess: invalidate,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw { code: "UNAUTHORIZED", message: "Login necessário." };
      await configureRevenueCat(userId);
      const offerings = await getOfferings();
      const pkg = pickPremiumPackage(offerings);
      if (!pkg) {
        throw {
          code: "NOT_CONFIGURED",
          message: "Oferta Premium indisponível.",
        };
      }
      await purchasePremiumPackage(pkg);
      return syncMobileBilling();
    },
    onSuccess: invalidate,
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw { code: "UNAUTHORIZED", message: "Login necessário." };
      await configureRevenueCat(userId);
      await restorePurchases();
      return syncMobileBilling();
    },
    onSuccess: invalidate,
  });

  const resolveError = (error: unknown): BillingError => {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    ) {
      return error as BillingError;
    }
    return mapPurchasesError(error);
  };

  const errorMessage = (error: unknown) => {
    const mapped = resolveError(error);
    return (
      BILLING_ERROR_MESSAGES[mapped.code] ??
      mapped.message ??
      BILLING_ERROR_MESSAGES.default
    );
  };

  const isLoading =
    statusQuery.isLoading ||
    purchaseMutation.isPending ||
    restoreMutation.isPending ||
    syncMutation.isPending;

  const isPremium = statusQuery.data?.isPremium ?? false;
  const isTrial = statusQuery.data?.mobileSubscription?.is_trial === true;

  return {
    statusQuery,
    isPremium,
    isTrial,
    isLoading,
    plan: statusQuery.data?.plan ?? "FREE",
    limits: statusQuery.data?.limits,
    purchase: purchaseMutation,
    restore: restoreMutation,
    sync: syncMutation,
    errorMessage,
    invalidate,
    checkLocalPremium: async () => {
      if (!userId) return false;
      await configureRevenueCat(userId);
      const info = await getCustomerInfo();
      return {
        isPremium: hasPremiumEntitlement(info),
        isTrial: isTrialEntitlement(info),
      };
    },
  };
}
