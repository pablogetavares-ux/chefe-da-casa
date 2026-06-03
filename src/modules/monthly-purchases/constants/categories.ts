import type { MonthPurchaseCategory } from "@/modules/monthly-purchases/types";

/** Categorias padrão do módulo Compras do Mês */
export const MONTH_PURCHASE_CATEGORY_LABELS: Record<
  MonthPurchaseCategory,
  string
> = {
  MERCEARIA: "Mercearia",
  HORTIFRUTI: "Hortifruti",
  CARNES: "Carnes",
  LIMPEZA: "Limpeza",
  HIGIENE: "Higiene",
  PADARIA: "Padaria",
  BEBIDAS: "Bebidas",
  OUTROS: "Outros",
};

export const MONTH_PURCHASE_CATEGORIES = [
  "MERCEARIA",
  "HORTIFRUTI",
  "CARNES",
  "LIMPEZA",
  "HIGIENE",
  "PADARIA",
  "BEBIDAS",
  "OUTROS",
] as const satisfies readonly MonthPurchaseCategory[];

export const MONTH_PURCHASE_CATEGORY_ORDER: MonthPurchaseCategory[] = [
  "MERCEARIA",
  "HORTIFRUTI",
  "CARNES",
  "PADARIA",
  "BEBIDAS",
  "HIGIENE",
  "LIMPEZA",
  "OUTROS",
];

const LEGACY_CATEGORY_MAP: Record<string, MonthPurchaseCategory> = {
  LATICINIOS: "MERCEARIA",
};

export function normalizeMonthPurchaseCategory(
  value: string,
): MonthPurchaseCategory {
  const upper = value.toUpperCase();
  if (isMonthPurchaseCategory(upper)) return upper;
  if (upper in LEGACY_CATEGORY_MAP) return LEGACY_CATEGORY_MAP[upper];
  return "OUTROS";
}

export function isMonthPurchaseCategory(
  value: string,
): value is MonthPurchaseCategory {
  return MONTH_PURCHASE_CATEGORY_ORDER.includes(value as MonthPurchaseCategory);
}
