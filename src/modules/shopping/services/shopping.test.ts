import { describe, expect, it } from "vitest";

import {
  inferShoppingCategory,
  groupItemsByCategory,
} from "@/modules/shopping/constants/categories";
import {
  computeOfferSavings,
  computeShoppingSummary,
  mergeSummaryPotential,
} from "@/modules/shopping/services/savings";
import type { SmartShoppingListItem } from "@/modules/shopping/types";

function item(
  overrides: Partial<SmartShoppingListItem> & { name: string },
): SmartShoppingListItem {
  return {
    id: "1",
    shopping_list_id: "list-1",
    quantity: null,
    unit: null,
    sort_order: 0,
    is_checked: false,
    created_at: "",
    updated_at: "",
    ingredient_id: null,
    category: "OUTROS",
    source: "manual",
    recipe_id: null,
    offer_id: null,
    unit_price: null,
    estimated_savings: null,
    ...overrides,
  };
}

describe("inferShoppingCategory", () => {
  it("classifica hortifruti", () => {
    expect(inferShoppingCategory("Tomate cereja")).toBe("HORTIFRUTI");
    expect(inferShoppingCategory("Cebola roxa")).toBe("HORTIFRUTI");
  });

  it("classifica laticínios", () => {
    expect(inferShoppingCategory("Leite integral")).toBe("LATICINIOS");
  });

  it("fallback para outros", () => {
    expect(inferShoppingCategory("Item desconhecido")).toBe("OUTROS");
  });
});

describe("groupItemsByCategory", () => {
  it("agrupa apenas pendentes por padrão", () => {
    const grouped = groupItemsByCategory([
      item({ name: "Tomate", category: "HORTIFRUTI" }),
      item({ name: "Leite", category: "LATICINIOS", is_checked: true }),
    ]);

    expect(grouped.get("HORTIFRUTI")).toHaveLength(1);
    expect(grouped.has("LATICINIOS")).toBe(false);
  });
});

describe("shopping savings", () => {
  it("calcula economia de oferta", () => {
    expect(computeOfferSavings(5, 8)).toBe(3);
    expect(computeOfferSavings(5, 4)).toBe(0);
  });

  it("resume economia confirmada e potencial", () => {
    const summary = computeShoppingSummary([
      item({
        name: "Tomate",
        estimated_savings: 2.5,
        offer_id: "offer-1",
      }),
      item({ name: "Arroz", is_checked: true }),
    ]);

    expect(summary.pendingItems).toBe(1);
    expect(summary.checkedItems).toBe(1);
    expect(summary.confirmedSavings).toBe(2.5);

    const merged = mergeSummaryPotential(summary, 1.2);
    expect(merged.potentialSavings).toBe(1.2);
  });
});
