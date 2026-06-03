import { MONTH_PURCHASE_CATEGORY_ORDER } from "@/modules/monthly-purchases/constants/categories";
import type {
  MonthListFilter,
  MonthPurchaseCategory,
  MonthShoppingItem,
  MonthShoppingListSummary,
} from "@/modules/monthly-purchases/types";
import { roundMoney } from "@/modules/shopping/services/savings";

export type CategoryGroup = {
  category: MonthPurchaseCategory;
  items: MonthShoppingItem[];
  subtotal: number;
  purchasedCount: number;
};

export type MonthPurchaseInsights = MonthShoppingListSummary & {
  averagePerItem: number | null;
  categoryCount: number;
  topCategory: MonthPurchaseCategory | null;
  groups: CategoryGroup[];
  progressPercent: number;
};

function summarize(items: MonthShoppingItem[]): MonthShoppingListSummary {
  const purchased = items.filter((i) => i.is_purchased);
  const pending = items.filter((i) => !i.is_purchased);
  const totalSpent = roundMoney(
    items.reduce((sum, i) => sum + (i.price_paid ?? 0), 0),
  );
  const spentOnPurchased = roundMoney(
    purchased.reduce((sum, i) => sum + (i.price_paid ?? 0), 0),
  );

  return {
    itemCount: items.length,
    purchasedCount: purchased.length,
    pendingCount: pending.length,
    totalSpent,
    spentOnPurchased,
  };
}

export function buildMonthPurchaseInsights(
  items: MonthShoppingItem[],
): MonthPurchaseInsights {
  const base = summarize(items);
  const priced = items.filter((i) => i.price_paid != null && i.price_paid > 0);
  const averagePerItem =
    priced.length > 0 ? roundMoney(base.totalSpent / priced.length) : null;

  const byCategory = new Map<MonthPurchaseCategory, MonthShoppingItem[]>();
  for (const item of items) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  const groups: CategoryGroup[] = MONTH_PURCHASE_CATEGORY_ORDER.filter((cat) =>
    byCategory.has(cat),
  ).map((category) => {
    const catItems = byCategory.get(category)!;
    return {
      category,
      items: catItems,
      subtotal: roundMoney(
        catItems.reduce((sum, i) => sum + (i.price_paid ?? 0), 0),
      ),
      purchasedCount: catItems.filter((i) => i.is_purchased).length,
    };
  });

  const topCategory =
    groups.length > 0
      ? groups.reduce((best, g) => (g.subtotal > best.subtotal ? g : best))
          .category
      : null;

  const progressPercent =
    base.itemCount > 0
      ? Math.round((base.purchasedCount / base.itemCount) * 100)
      : 0;

  return {
    ...base,
    averagePerItem,
    categoryCount: groups.length,
    topCategory,
    groups,
    progressPercent,
  };
}

export function filterMonthItems(
  items: MonthShoppingItem[],
  options: { query?: string; listFilter?: MonthListFilter },
): MonthShoppingItem[] {
  let result = items;

  if (options.listFilter === "pending") {
    result = result.filter((i) => !i.is_purchased);
  } else if (options.listFilter === "purchased") {
    result = result.filter((i) => i.is_purchased);
  }

  const q = options.query?.trim().toLowerCase();
  if (!q) return result;

  return result.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.notes?.toLowerCase().includes(q) ?? false),
  );
}
