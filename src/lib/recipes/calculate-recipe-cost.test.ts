import { describe, expect, it } from "vitest";

import {
  calculateRecipeCost,
  computeQuantityFactor,
  matchIngredientsToProducts,
} from "@/lib/recipes/calculate-recipe-cost";
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

describe("computeQuantityFactor", () => {
  it("usa mesma unidade sem estimativa", () => {
    expect(computeQuantityFactor(2, "kg", "kg")).toEqual({
      factor: 2,
      estimated: false,
    });
  });

  it("converte gramas para kg", () => {
    expect(computeQuantityFactor(500, "g", "kg")).toEqual({
      factor: 0.5,
      estimated: false,
    });
  });
});

describe("calculateRecipeCost", () => {
  it("rankeia mercados do mais barato ao mais caro", () => {
    const result = calculateRecipeCost(
      [
        { name: "tomate", quantity: 1, unit: "kg" },
        { name: "ovo", quantity: 1, unit: "un" },
      ],
      products,
    );

    expect(result.marketRankings.length).toBeGreaterThan(0);
    expect(result.cheapestMarket?.marketName).toBeDefined();
    expect(result.summary.priceSpread).toBeGreaterThanOrEqual(0);
    expect(result.marketRankings[0].totalCost).toBeLessThanOrEqual(
      result.marketRankings[result.marketRankings.length - 1].totalCost,
    );
  });

  it("ignora ingredientes opcionais", () => {
    const matched = matchIngredientsToProducts(
      [
        { name: "Sal", quantity: 1, unit: "pitada", optional: true },
        { name: "tomate", quantity: 1, unit: "kg" },
      ],
      products,
    );
    expect(matched).toHaveLength(1);
    expect(matched[0].ingredient.name).toBe("tomate");
  });
});
