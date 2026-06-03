import type { MonthPurchaseCategory } from "@/modules/monthly-purchases/types";

export type MonthlyQuickItem = {
  name: string;
  category: MonthPurchaseCategory;
  unit?: string;
};

export const MONTHLY_QUICK_ITEMS: MonthlyQuickItem[] = [
  { name: "Arroz", category: "MERCEARIA", unit: "kg" },
  { name: "Feijão", category: "MERCEARIA", unit: "kg" },
  { name: "Leite", category: "MERCEARIA", unit: "L" },
  { name: "Sabão em pó", category: "LIMPEZA", unit: "kg" },
  { name: "Papel higiênico", category: "HIGIENE", unit: "pct" },
  { name: "Frango", category: "CARNES", unit: "kg" },
  { name: "Tomate", category: "HORTIFRUTI", unit: "kg" },
  { name: "Banana", category: "HORTIFRUTI", unit: "kg" },
  { name: "Pão", category: "PADARIA", unit: "un" },
  { name: "Café", category: "MERCEARIA", unit: "pct" },
];
