import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
  PURCHASES_ERROR_CODE,
} from "react-native-purchases";

import { env } from "@/config/env";
import { ENTITLEMENT_PREMIUM } from "@/modules/billing/constants";
import type { BillingError } from "@/modules/billing/types";

let configuredForUser: string | null = null;

export function mapPurchasesError(error: unknown): BillingError {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  ) {
    return { code: "PURCHASE_CANCELLED", message: "Compra cancelada." };
  }

  if (error instanceof Error) {
    if (error.message.includes("network")) {
      return { code: "NETWORK_ERROR", message: "Sem conexão." };
    }
    return { code: "UNKNOWN", message: error.message };
  }

  return { code: "UNKNOWN", message: "Erro desconhecido." };
}

export async function configureRevenueCat(appUserId: string) {
  if (Platform.OS !== "android") {
    throw { code: "NOT_CONFIGURED", message: "Android only in this build." };
  }

  if (!env.revenueCatAndroidKey) {
    throw { code: "NOT_CONFIGURED", message: "RevenueCat API key ausente." };
  }

  if (configuredForUser !== appUserId) {
    Purchases.configure({
      apiKey: env.revenueCatAndroidKey,
      appUserID: appUserId,
    });
    configuredForUser = appUserId;
  }
}

export function hasPremiumEntitlement(info: CustomerInfo) {
  const entitlement = info.entitlements.active[ENTITLEMENT_PREMIUM];
  return Boolean(entitlement?.isActive);
}

export function isTrialEntitlement(info: CustomerInfo) {
  const entitlement = info.entitlements.active[ENTITLEMENT_PREMIUM];
  return entitlement?.periodType === "TRIAL";
}

export async function getOfferings(): Promise<PurchasesOfferings> {
  return Purchases.getOfferings();
}

export function pickPremiumPackage(
  offerings: PurchasesOfferings,
): PurchasesPackage | null {
  const current = offerings.current;
  if (!current) return null;

  return (
    current.monthly ??
    current.availablePackages.find((pkg) =>
      pkg.identifier.includes("monthly"),
    ) ??
    current.availablePackages[0] ??
    null
  );
}

export async function purchasePremiumPackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}

export async function getCustomerInfo() {
  return Purchases.getCustomerInfo();
}
