import type { UserOfferContext } from "@/modules/offers/services/user-offer-context";
import type { OfferCategory, RegionalOffer } from "@/modules/offers/types";

export function categoryBoost(
  category: OfferCategory,
  weights: Partial<Record<OfferCategory, number>>,
): number {
  return weights[category] ?? 0;
}

function compositeScore(
  offer: RegionalOffer,
  weights: Partial<Record<OfferCategory, number>>,
) {
  const match = (offer.matchScore ?? 0) * 12;
  const profile = categoryBoost(offer.category, weights) * 2;
  const discount = (offer.discountPercent ?? 0) * 0.15;
  const relevance = (offer.searchRelevance ?? 0) * 0.05;
  return match + profile + discount + relevance;
}

/**
 * Reordena ofertas respeitando match de ingredientes/itens e perfil familiar.
 * Marca `isSuggested` quando a oferta é relevante ao perfil sem match direto.
 */
export function applyUserOfferPrioritization(
  offers: RegionalOffer[],
  context: UserOfferContext,
): RegionalOffer[] {
  const { categoryWeights, priorityCategories } = context;
  const prioritySet = new Set(priorityCategories);

  return [...offers]
    .sort(
      (a, b) =>
        compositeScore(b, categoryWeights) - compositeScore(a, categoryWeights),
    )
    .map((offer) => ({
      ...offer,
      isSuggested:
        offer.isSuggested ??
        ((offer.matchScore ?? 0) === 0 && prioritySet.has(offer.category)),
    }));
}
