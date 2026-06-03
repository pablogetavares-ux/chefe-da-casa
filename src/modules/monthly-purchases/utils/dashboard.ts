import { MONTH_PURCHASE_CATEGORY_LABELS } from "@/modules/monthly-purchases/constants/categories";
import {
  periodLabel,
  shiftPeriod,
} from "@/modules/monthly-purchases/constants/period";
import type {
  MonthPeriod,
  MonthPurchaseDashboard,
  MonthPurchaseDashboardPeriod,
  MonthPurchaseCategorySpend,
  MonthShoppingItem,
} from "@/modules/monthly-purchases/types";
import { buildMonthPurchaseInsights } from "@/modules/monthly-purchases/utils/insights";
import { roundMoney } from "@/modules/shopping/services/savings";

function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? null : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function periodFromItems(
  items: MonthShoppingItem[],
  period: MonthPeriod,
): MonthPurchaseDashboardPeriod {
  const insights = buildMonthPurchaseInsights(items);
  const topGroup = insights.groups.reduce<
    (typeof insights.groups)[number] | null
  >((best, group) => {
    if (!best || group.subtotal > best.subtotal) return group;
    return best;
  }, null);

  const categoryBreakdown: MonthPurchaseCategorySpend[] = insights.groups.map(
    (group) => ({
      category: group.category,
      label: MONTH_PURCHASE_CATEGORY_LABELS[group.category],
      amount: group.subtotal,
    }),
  );

  return {
    month: period.month,
    year: period.year,
    label: periodLabel(period.month, period.year),
    itemCount: insights.itemCount,
    totalSpent: insights.totalSpent,
    topCategory: insights.topCategory,
    topCategoryLabel: insights.topCategory
      ? MONTH_PURCHASE_CATEGORY_LABELS[insights.topCategory]
      : null,
    topCategoryAmount: topGroup?.subtotal ?? 0,
    categoryBreakdown,
  };
}

export function buildMonthPurchaseDashboard(
  currentItems: MonthShoppingItem[],
  period: MonthPeriod,
  previousItems: MonthShoppingItem[] | null,
): MonthPurchaseDashboard {
  const current = periodFromItems(currentItems, period);
  const previousPeriod = shiftPeriod(period.month, period.year, -1);
  const previous = previousItems
    ? periodFromItems(previousItems, previousPeriod)
    : null;

  const insights = buildMonthPurchaseInsights(currentItems);
  const hasPreviousData = Boolean(previous && previous.itemCount > 0);

  const spendDelta = roundMoney(
    current.totalSpent - (previous?.totalSpent ?? 0),
  );
  const itemCountDelta = current.itemCount - (previous?.itemCount ?? 0);

  return {
    current,
    previous,
    comparison: {
      previousLabel:
        previous?.label ??
        periodLabel(previousPeriod.month, previousPeriod.year),
      spendDelta,
      spendChangePercent: previous
        ? percentChange(current.totalSpent, previous.totalSpent)
        : null,
      itemCountDelta,
      itemCountChangePercent: previous
        ? percentChange(current.itemCount, previous.itemCount)
        : null,
      hasPreviousData,
    },
    progressPercent: insights.progressPercent,
    purchasedCount: insights.purchasedCount,
    pendingCount: insights.pendingCount,
  };
}
