import type {
  MonthlyPurchaseItemRow,
  MonthlyPurchaseListRow,
} from "@/types/database";

import { normalizeMonthPurchaseCategory } from "@/modules/monthly-purchases/constants/categories";
import type {
  MonthShoppingItem,
  MonthShoppingList,
} from "@/modules/monthly-purchases/types";

export function mapListRow(row: MonthlyPurchaseListRow): MonthShoppingList {
  return {
    id: row.id,
    user_id: row.user_id,
    month: row.month,
    year: row.year,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapItemRow(row: MonthlyPurchaseItemRow): MonthShoppingItem {
  return {
    id: row.id,
    shopping_list_id: row.monthly_purchase_list_id,
    name: row.name,
    category: normalizeMonthPurchaseCategory(row.category),
    quantity: row.quantity != null ? Number(row.quantity) : null,
    unit: row.unit,
    price_paid: row.price_paid != null ? Number(row.price_paid) : null,
    notes: row.notes,
    is_purchased: Boolean(row.is_purchased),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
