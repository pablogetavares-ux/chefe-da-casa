/**
 * Compras do Mês — domínio isolado.
 * Tabelas: `monthly_purchase_lists`, `monthly_purchase_items`.
 */

export type MonthShoppingList = {
  id: string;
  user_id: string;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
};

export type MonthShoppingItem = {
  id: string;
  shopping_list_id: string;
  name: string;
  category: MonthPurchaseCategory;
  quantity: number | null;
  unit: string | null;
  price_paid: number | null;
  notes: string | null;
  is_purchased: boolean;
  created_at: string;
  updated_at: string;
};

export type MonthPurchaseCategory =
  | "MERCEARIA"
  | "HORTIFRUTI"
  | "CARNES"
  | "LIMPEZA"
  | "HIGIENE"
  | "PADARIA"
  | "BEBIDAS"
  | "OUTROS";

export type MonthShoppingListSummary = {
  itemCount: number;
  purchasedCount: number;
  pendingCount: number;
  totalSpent: number;
  spentOnPurchased: number;
};

export type MonthShoppingListWithItems = {
  list: MonthShoppingList | null;
  items: MonthShoppingItem[];
  summary: MonthShoppingListSummary;
  period: MonthPeriod;
};

export type MonthPeriod = {
  month: number;
  year: number;
};

export type MonthListFilter = "all" | "pending" | "purchased";

export type MonthCopySource = {
  month: number;
  year: number;
  label: string;
  itemCount: number;
};

export type MonthCopySuggestion = {
  shouldPrompt: boolean;
  current: MonthPeriod;
  /** Meses do mesmo ano com itens, exceto o mês de destino. */
  sources: MonthCopySource[];
  defaultSource: MonthPeriod | null;
  defaultSourceLabel: string;
  defaultSourceItemCount: number;
  currentHasList: boolean;
  currentItemCount: number;
};

export type MonthPurchaseHistoryEntry = {
  listId: string;
  month: number;
  year: number;
  label: string;
  itemCount: number;
  totalSpent: number;
  purchasedCount: number;
  updatedAt: string;
  isCurrentMonth: boolean;
};

export type MonthPurchaseHistoryResponse = {
  entries: MonthPurchaseHistoryEntry[];
};

export type MonthPurchaseCategorySpend = {
  category: MonthPurchaseCategory;
  label: string;
  amount: number;
};

export type MonthPurchaseDashboardPeriod = {
  month: number;
  year: number;
  label: string;
  itemCount: number;
  totalSpent: number;
  topCategory: MonthPurchaseCategory | null;
  topCategoryLabel: string | null;
  topCategoryAmount: number;
  categoryBreakdown: MonthPurchaseCategorySpend[];
};

export type MonthPurchaseDashboard = {
  current: MonthPurchaseDashboardPeriod;
  previous: MonthPurchaseDashboardPeriod | null;
  comparison: {
    previousLabel: string;
    spendDelta: number;
    spendChangePercent: number | null;
    itemCountDelta: number;
    itemCountChangePercent: number | null;
    hasPreviousData: boolean;
  };
  progressPercent: number;
  purchasedCount: number;
  pendingCount: number;
};
