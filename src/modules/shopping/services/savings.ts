import type {
  ShoppingListSummary,
  SmartShoppingListItem,
} from "@/modules/shopping/types";

export function computeShoppingSummary(
  items: SmartShoppingListItem[],
): ShoppingListSummary {
  const pending = items.filter((item) => !item.is_checked);
  const checked = items.filter((item) => item.is_checked);

  const confirmedSavings = pending.reduce(
    (sum, item) => sum + (item.estimated_savings ?? 0),
    0,
  );

  return {
    totalItems: items.length,
    pendingItems: pending.length,
    checkedItems: checked.length,
    confirmedSavings: roundMoney(confirmedSavings),
    potentialSavings: 0,
  };
}

export function computeOfferSavings(
  currentPrice: number,
  previousPrice: number | null | undefined,
): number {
  if (previousPrice == null || previousPrice <= currentPrice) return 0;
  return roundMoney(previousPrice - currentPrice);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatShoppingMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function mergeSummaryPotential(
  summary: ShoppingListSummary,
  potentialSavings: number,
): ShoppingListSummary {
  return {
    ...summary,
    potentialSavings: roundMoney(potentialSavings),
  };
}
