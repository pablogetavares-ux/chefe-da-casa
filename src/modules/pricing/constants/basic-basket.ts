import type { CompareItemInput } from "@/modules/pricing/types";

/** Cesta básica simplificada para comparação regional (expansível). */
export const BASIC_BASKET_ITEMS: CompareItemInput[] = [
  { name: "Arroz", quantity: 1 },
  { name: "Feijão", quantity: 1 },
  { name: "Leite", quantity: 1 },
  { name: "Ovos", quantity: 1 },
  { name: "Tomate", quantity: 1 },
  { name: "Cebola", quantity: 1 },
  { name: "Batata", quantity: 1 },
  { name: "Frango", quantity: 1 },
  { name: "Pão", quantity: 1 },
  { name: "Açúcar", quantity: 1 },
  { name: "Óleo", quantity: 1 },
  { name: "Café", quantity: 1 },
];

export const BASIC_BASKET_LABEL = "Cesta básica (12 itens)";
