import { describe, expect, it } from "vitest";

import { compareMarketsForShoppingList } from "@/lib/markets/compare-shopping-list";
import type { ProductWithMarketPrices } from "@/lib/recipes/calculate-recipe-cost";

const products: ProductWithMarketPrices[] = [
  {
    id: "p1",
    name: "Tomate italiano",
    slug: "tomate-italiano",
    base_unit: "kg",
    market_prices: [
      { id: "m1", market_name: "Atacadão", price: 5.99 },
      { id: "m2", market_name: "Extra", price: 6.49 },
    ],
  },
  {
    id: "p2",
    name: "Ovos brancos dúzia",
    slug: "ovos-brancos-duzia",
    base_unit: "un",
    market_prices: [
      { id: "m3", market_name: "Extra", price: 13.99 },
      { id: "m4", market_name: "Carrefour", price: 14.9 },
    ],
  },
];

describe("compareMarketsForShoppingList", () => {
  it("rankeia mercados e destaca o mais barato", () => {
    const result = compareMarketsForShoppingList(
      [
        { name: "tomate", quantity: 1, unit: "kg" },
        { name: "ovo", quantity: 1, unit: "un" },
      ],
      products,
    );

    expect(result.bestMarket?.isBest).toBe(true);
    expect(result.rankings[0].totalCost).toBeLessThanOrEqual(
      result.rankings[result.rankings.length - 1].totalCost,
    );
    expect(result.summary.savingsVsMostExpensive).toBeGreaterThanOrEqual(0);
    expect(result.comparisonTable).toHaveLength(2);
  });

  it("monta tabela com preços por mercado", () => {
    const result = compareMarketsForShoppingList(
      [{ name: "tomate", quantity: 1, unit: "kg" }],
      products,
    );

    const row = result.comparisonTable[0];
    expect(row.pricesByMarket.length).toBeGreaterThan(0);
    expect(row.cheapestMarket).toBeTruthy();
  });
});
