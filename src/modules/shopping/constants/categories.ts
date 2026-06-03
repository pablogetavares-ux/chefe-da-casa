import type { ShoppingItemCategory } from "@/modules/shopping/types";

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingItemCategory, string> = {
  HORTIFRUTI: "Hortifruti",
  CARNES: "Carnes e peixes",
  LATICINIOS: "Laticínios",
  MERCEARIA: "Mercearia",
  PADARIA: "Padaria",
  BEBIDAS: "Bebidas",
  LIMPEZA: "Limpeza",
  OUTROS: "Outros",
};

export const SHOPPING_CATEGORY_ORDER: ShoppingItemCategory[] = [
  "HORTIFRUTI",
  "CARNES",
  "LATICINIOS",
  "PADARIA",
  "MERCEARIA",
  "BEBIDAS",
  "LIMPEZA",
  "OUTROS",
];

/** Palavras-chave → categoria (primeiro match vence). */
const CATEGORY_KEYWORDS: Array<{
  category: ShoppingItemCategory;
  terms: string[];
}> = [
  {
    category: "HORTIFRUTI",
    terms: [
      "tomate",
      "alface",
      "cebola",
      "batata",
      "cenoura",
      "limão",
      "maçã",
      "maca",
      "banana",
      "alho",
      "piment",
      "couve",
      "abob",
      "folha",
      "salada",
      "fruta",
      "verdura",
    ],
  },
  {
    category: "CARNES",
    terms: [
      "frango",
      "carne",
      "peixe",
      "salm",
      "ovo",
      "ovos",
      "bacon",
      "lingui",
      "camar",
    ],
  },
  {
    category: "LATICINIOS",
    terms: [
      "leite",
      "iogurte",
      "queijo",
      "manteiga",
      "requeij",
      "creme",
      "nata",
    ],
  },
  {
    category: "PADARIA",
    terms: ["pão", "pao", "baguete", "bisnaga", "torrada", "bolo"],
  },
  {
    category: "MERCEARIA",
    terms: [
      "arroz",
      "feijão",
      "feijao",
      "macarrão",
      "macarrao",
      "azeite",
      "óleo",
      "oleo",
      "sal ",
      "açúcar",
      "acucar",
      "farinha",
      "molho",
      "tempero",
    ],
  },
  {
    category: "BEBIDAS",
    terms: ["suco", "refriger", "água", "agua", "café", "cafe", "chá", "cha"],
  },
  {
    category: "LIMPEZA",
    terms: ["deterg", "sabão", "sabao", "desinfet", "papel hig", "esponja"],
  },
];

export function inferShoppingCategory(name: string): ShoppingItemCategory {
  const haystack = name.toLowerCase();

  for (const { category, terms } of CATEGORY_KEYWORDS) {
    if (terms.some((term) => haystack.includes(term))) {
      return category;
    }
  }

  return "OUTROS";
}

export function groupItemsByCategory<
  T extends { category: string; is_checked: boolean },
>(items: T[], pendingOnly = true): Map<ShoppingItemCategory, T[]> {
  const filtered = pendingOnly ? items.filter((i) => !i.is_checked) : items;
  const map = new Map<ShoppingItemCategory, T[]>();

  for (const category of SHOPPING_CATEGORY_ORDER) {
    map.set(category, []);
  }

  for (const item of filtered) {
    const key =
      (item.category as ShoppingItemCategory) in SHOPPING_CATEGORY_LABELS
        ? (item.category as ShoppingItemCategory)
        : "OUTROS";
    map.get(key)?.push(item);
  }

  for (const [key, group] of map) {
    if (group.length === 0) map.delete(key);
  }

  return map;
}
