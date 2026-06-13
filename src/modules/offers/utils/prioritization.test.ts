import { describe, expect, it } from "vitest";

import { buildUserOfferContext } from "@/modules/offers/services/user-offer-context";
import type { RegionalOffer } from "@/modules/offers/types";
import { applyUserOfferPrioritization } from "@/modules/offers/utils/prioritization";

function stubOffer(
  partial: Partial<RegionalOffer> & Pick<RegionalOffer, "id" | "category">,
): RegionalOffer {
  return {
    id: partial.id,
    category: partial.category,
    store_id: "store-1",
    title: partial.title ?? "Oferta",
    product_name: partial.product_name ?? "Produto",
    description: null,
    current_price: 10,
    previous_price: 12,
    unit: "un",
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 86400000).toISOString(),
    is_active: true,
    ingredient_keywords: [],
    image_url: null,
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    store: {
      id: "store-1",
      name: "Loja Centro",
      chain: "Loja",
      city: "BH",
      state: "MG",
      neighborhood: null,
      is_active: true,
      created_at: new Date().toISOString(),
      vertical_id: null,
      latitude: null,
      longitude: null,
    },
    discountPercent: partial.discountPercent ?? 10,
    matchScore: partial.matchScore,
    isSuggested: partial.isSuggested,
  } as RegionalOffer;
}

describe("applyUserOfferPrioritization", () => {
  it("prioriza categorias do plano Família sem perder match de ingrediente", () => {
    const context = buildUserOfferContext({
      plan: "FAMILY",
      fitness_goal: null,
      senior_mode_enabled: false,
      offer_preferences: {},
    });

    const offers = [
      stubOffer({ id: "1", category: "CLEANING", matchScore: 0 }),
      stubOffer({ id: "2", category: "DAIRY", matchScore: 0 }),
      stubOffer({ id: "3", category: "PRODUCE", matchScore: 2 }),
    ];

    const sorted = applyUserOfferPrioritization(offers, context);

    expect(sorted[0]?.id).toBe("3");
    expect(sorted.some((offer) => offer.id === "2" && offer.isSuggested)).toBe(
      true,
    );
  });
});

describe("buildUserOfferContext", () => {
  it("combina plano Família e meta fitness", () => {
    const context = buildUserOfferContext({
      plan: "FAMILY",
      fitness_goal: "gain_muscle",
      senior_mode_enabled: false,
      offer_preferences: {},
    });

    expect(context.priorityCategories).toContain("MEAT");
    expect(context.personalizationReason).toMatch(/Família/);
    expect(context.personalizationReason).toMatch(/ganho muscular/);
  });
});
