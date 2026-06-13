import { describe, expect, it } from "vitest";

import type { RegionalOffer } from "@/modules/offers/types";
import {
  offerMatchesSearch,
  scoreOfferSearchRelevance,
  sortRegionalOffers,
} from "@/modules/offers/utils/search";

const baseOffer = {
  id: "1",
  store_id: "s1",
  title: "Leite integral 1L",
  product_name: "Leite Tirol 1L",
  description: "Leite fresco",
  category: "DAIRY" as const,
  category_id: "cat-dairy",
  current_price: 4.99,
  previous_price: 6.49,
  ingredient_keywords: ["leite"],
  is_active: true,
  valid_from: "",
  valid_until: "2099-01-01",
  image_url: null,
  unit: "un",
  created_at: "",
  updated_at: "",
  store: {
    id: "s1",
    name: "Extra Savassi",
    chain: "Extra",
    city: "Belo Horizonte",
    state: "MG",
    neighborhood: "Savassi",
    created_at: "",
    is_active: true,
    latitude: null,
    longitude: null,
    vertical_id: null,
  },
  discountPercent: 23,
} satisfies RegionalOffer;

const categories = [
  {
    id: "cat-dairy",
    slug: "dairy",
    name: "Laticínios",
    verticalId: "v1",
    verticalSlug: "supermarket",
    legacyEnum: "DAIRY" as const,
    parentId: null,
    sortOrder: 1,
  },
];

describe("offer search", () => {
  it("encontra produto por termo parcial", () => {
    expect(offerMatchesSearch(baseOffer, "leite", "product", categories)).toBe(
      true,
    );
    expect(offerMatchesSearch(baseOffer, "cafe", "product", categories)).toBe(
      false,
    );
  });

  it("encontra loja por rede", () => {
    expect(offerMatchesSearch(baseOffer, "extra", "store", categories)).toBe(
      true,
    );
  });

  it("encontra categoria por nome", () => {
    expect(
      offerMatchesSearch(baseOffer, "laticinios", "category", categories),
    ).toBe(true);
  });

  it("ordena por menor preço", () => {
    const cheap = { ...baseOffer, id: "2", current_price: 2.5 };
    const sorted = sortRegionalOffers([baseOffer, cheap], "price_asc");
    expect(sorted[0]?.id).toBe("2");
  });

  it("pontua relevância maior para match exato de produto", () => {
    const exact = scoreOfferSearchRelevance(
      baseOffer,
      "leite tirol 1l",
      "product",
      categories,
    );
    const partial = scoreOfferSearchRelevance(
      baseOffer,
      "leit",
      "product",
      categories,
    );
    expect(exact).toBeGreaterThan(partial);
  });
});
