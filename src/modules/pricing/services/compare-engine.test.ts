import { describe, expect, it } from "vitest";

import {
  assemblePriceComparison,
  buildStoreRankings,
  compareItemsAgainstOffers,
} from "@/modules/pricing/services/compare-engine";
import type { RegionalOffer } from "@/modules/offers/types";

function mockOffer(input: {
  id: string;
  chain: string;
  storeId: string;
  city?: string;
  productName: string;
  price: number;
  keywords?: string[];
}): RegionalOffer {
  return {
    id: input.id,
    store_id: input.storeId,
    title: input.productName,
    description: null,
    category: "PANTRY",
    product_name: input.productName,
    current_price: input.price,
    previous_price: input.price + 2,
    unit: "un",
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 86_400_000).toISOString(),
    image_url: null,
    ingredient_keywords: input.keywords ?? [input.productName.toLowerCase()],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: input.storeId,
      name: `${input.chain} Centro`,
      chain: input.chain,
      city: input.city ?? "Belo Horizonte",
      state: "MG",
      neighborhood: null,
      latitude: -19.9167,
      longitude: -43.9345,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  };
}

describe("compareItemsAgainstOffers", () => {
  it("encontra candidatos ordenados por preço", () => {
    const offers = [
      mockOffer({
        id: "o1",
        chain: "Carrefour",
        storeId: "s1",
        productName: "Arroz Tio João 5kg",
        price: 22.9,
        keywords: ["arroz"],
      }),
      mockOffer({
        id: "o2",
        chain: "Extra",
        storeId: "s2",
        productName: "Arroz Branco 5kg",
        price: 19.9,
        keywords: ["arroz"],
      }),
    ];

    const [result] = compareItemsAgainstOffers([{ name: "Arroz" }], offers);

    expect(result.candidates).toHaveLength(2);
    expect(result.bestOffer?.storeChain).toBe("Extra");
    expect(result.bestOffer?.currentPrice).toBe(19.9);
  });
});

describe("buildStoreRankings", () => {
  it("ordena mercados pelo subtotal menor", () => {
    const itemComparisons = compareItemsAgainstOffers(
      [{ name: "Arroz" }, { name: "Feijão" }],
      [
        mockOffer({
          id: "a1",
          chain: "Carrefour",
          storeId: "s1",
          productName: "Arroz",
          price: 10,
          keywords: ["arroz"],
        }),
        mockOffer({
          id: "a2",
          chain: "Extra",
          storeId: "s2",
          productName: "Arroz",
          price: 8,
          keywords: ["arroz"],
        }),
        mockOffer({
          id: "f1",
          chain: "Carrefour",
          storeId: "s1",
          productName: "Feijão",
          price: 7,
          keywords: ["feijao", "feijão"],
        }),
        mockOffer({
          id: "f2",
          chain: "Extra",
          storeId: "s2",
          productName: "Feijão",
          price: 9,
          keywords: ["feijao", "feijão"],
        }),
      ],
    );

    const rankings = buildStoreRankings(itemComparisons);

    expect(rankings).toHaveLength(2);
    expect(rankings.every((store) => store.subtotal === 17)).toBe(true);
    expect(rankings.every((store) => store.matchedItems === 2)).toBe(true);
  });
});

describe("assemblePriceComparison", () => {
  it("calcula economia vs média e mercado mais caro", () => {
    const response = assemblePriceComparison(
      "Belo Horizonte",
      "basket",
      [{ name: "Arroz" }],
      [
        mockOffer({
          id: "1",
          chain: "A",
          storeId: "s1",
          productName: "Arroz",
          price: 10,
          keywords: ["arroz"],
        }),
        mockOffer({
          id: "2",
          chain: "B",
          storeId: "s2",
          productName: "Arroz",
          price: 14,
          keywords: ["arroz"],
        }),
      ],
    );

    expect(response.cheapestStore?.subtotal).toBe(10);
    expect(response.summary.estimatedSavingsVsMostExpensive).toBe(4);
    expect(response.summary.estimatedSavingsVsAverage).toBe(2);
  });
});
