import {
  scoreOfferForRecipe,
  termsForIngredientName,
} from "@/modules/offers/utils/matching";
import {
  computeOfferSavings,
  roundMoney,
} from "@/modules/shopping/services/savings";
import type { RegionalOffer } from "@/modules/offers/types";
import type {
  CompareItemInput,
  CompareSource,
  ItemComparisonResult,
  ItemOfferCandidate,
  PriceComparisonResponse,
  PriceComparisonSummary,
  StoreBasketTotal,
} from "@/modules/pricing/types";

const MIN_MATCH_SCORE = 1;

export function offerToCandidate(
  offer: RegionalOffer,
  matchScore: number,
): ItemOfferCandidate {
  return {
    offerId: offer.id,
    storeId: offer.store.id,
    storeChain: offer.store.chain,
    storeName: offer.store.name,
    storeCity: offer.store.city,
    productName: offer.product_name,
    title: offer.title,
    currentPrice: offer.current_price,
    previousPrice: offer.previous_price,
    unit: offer.unit,
    estimatedSavings: computeOfferSavings(
      offer.current_price,
      offer.previous_price,
    ),
    matchScore,
    imageUrl: offer.image_url,
  };
}

export function findOfferCandidatesForItem(
  itemName: string,
  offers: RegionalOffer[],
  maxCandidates = 12,
): ItemOfferCandidate[] {
  const terms = termsForIngredientName(itemName);

  const scored = offers
    .map((offer) => ({
      offer,
      score: scoreOfferForRecipe(offer, terms),
    }))
    .filter(({ score }) => score >= MIN_MATCH_SCORE)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.offer.current_price - b.offer.current_price;
    });

  const candidates: ItemOfferCandidate[] = [];
  const seenStoreProduct = new Set<string>();

  for (const { offer, score } of scored) {
    const key = `${offer.store.id}:${offer.product_name.toLowerCase()}`;
    if (seenStoreProduct.has(key)) continue;
    seenStoreProduct.add(key);
    candidates.push(offerToCandidate(offer, score));
    if (candidates.length >= maxCandidates) break;
  }

  return candidates.sort((a, b) => a.currentPrice - b.currentPrice);
}

export function compareItemsAgainstOffers(
  items: CompareItemInput[],
  offers: RegionalOffer[],
): ItemComparisonResult[] {
  return items.map((item) => {
    const candidates = findOfferCandidatesForItem(item.name, offers);
    return {
      itemId: item.id,
      itemName: item.name,
      quantity: item.quantity ?? 1,
      candidates,
      bestOffer: candidates[0] ?? null,
    };
  });
}

export function buildStoreRankings(
  itemComparisons: ItemComparisonResult[],
): StoreBasketTotal[] {
  const storeMap = new Map<
    string,
    Omit<StoreBasketTotal, "rank" | "estimatedSavings"> & {
      bestByItem: Map<string, ItemOfferCandidate>;
    }
  >();

  for (const item of itemComparisons) {
    const bestPerStore = new Map<string, ItemOfferCandidate>();

    for (const candidate of item.candidates) {
      const existing = bestPerStore.get(candidate.storeId);
      if (!existing || candidate.currentPrice < existing.currentPrice) {
        bestPerStore.set(candidate.storeId, candidate);
      }
    }

    for (const [storeId, candidate] of bestPerStore) {
      let store = storeMap.get(storeId);
      if (!store) {
        store = {
          storeId,
          storeChain: candidate.storeChain,
          storeName: candidate.storeName,
          storeCity: candidate.storeCity,
          matchedItems: 0,
          missingItems: 0,
          totalItems: itemComparisons.length,
          coveragePercent: 0,
          subtotal: 0,
          lineItems: [],
          bestByItem: new Map(),
        };
        storeMap.set(storeId, store);
      }

      store.bestByItem.set(item.itemName, candidate);
    }
  }

  const rankings: StoreBasketTotal[] = [];

  for (const store of storeMap.values()) {
    const matched = store.bestByItem.size;
    const missing = itemComparisons.length - matched;
    const lineItems = [...store.bestByItem.entries()].map(
      ([itemName, candidate]) => ({
        itemName,
        offerId: candidate.offerId,
        price: candidate.currentPrice,
        productName: candidate.productName,
      }),
    );

    const subtotal = roundMoney(
      lineItems.reduce((sum, line) => sum + line.price, 0),
    );

    rankings.push({
      storeId: store.storeId,
      storeChain: store.storeChain,
      storeName: store.storeName,
      storeCity: store.storeCity,
      rank: 0,
      matchedItems: matched,
      missingItems: missing,
      totalItems: itemComparisons.length,
      coveragePercent: roundMoney(
        (matched / Math.max(itemComparisons.length, 1)) * 100,
      ),
      subtotal,
      estimatedSavings: 0,
      lineItems,
    });
  }

  rankings.sort((a, b) => {
    if (b.coveragePercent !== a.coveragePercent) {
      return b.coveragePercent - a.coveragePercent;
    }
    return a.subtotal - b.subtotal;
  });

  const cheapestSubtotal = rankings[0]?.subtotal ?? 0;

  return rankings.map((store, index) => ({
    ...store,
    rank: index + 1,
    estimatedSavings: roundMoney(
      Math.max(0, store.subtotal - cheapestSubtotal),
    ),
  }));
}

export function buildComparisonSummary(
  storeRankings: StoreBasketTotal[],
  itemComparisons: ItemComparisonResult[],
): PriceComparisonSummary {
  const subtotals = storeRankings.map((store) => store.subtotal);
  const cheapestSubtotal = subtotals[0] ?? 0;
  const mostExpensiveSubtotal = subtotals[subtotals.length - 1] ?? 0;
  const averageSubtotal =
    subtotals.length > 0
      ? roundMoney(
          subtotals.reduce((sum, value) => sum + value, 0) / subtotals.length,
        )
      : 0;

  const itemsWithOffers = itemComparisons.filter(
    (item) => item.candidates.length > 0,
  ).length;

  return {
    totalItems: itemComparisons.length,
    itemsWithOffers,
    cheapestSubtotal,
    averageSubtotal,
    mostExpensiveSubtotal,
    estimatedSavingsVsAverage: roundMoney(
      Math.max(0, averageSubtotal - cheapestSubtotal),
    ),
    estimatedSavingsVsMostExpensive: roundMoney(
      Math.max(0, mostExpensiveSubtotal - cheapestSubtotal),
    ),
  };
}

export function assemblePriceComparison(
  city: string,
  source: CompareSource,
  items: CompareItemInput[],
  offers: RegionalOffer[],
  listId?: string,
): PriceComparisonResponse {
  const itemComparisons = compareItemsAgainstOffers(items, offers);
  const storeRankings = buildStoreRankings(itemComparisons);
  const summary = buildComparisonSummary(storeRankings, itemComparisons);

  return {
    city,
    source,
    listId,
    items: itemComparisons,
    storeRankings,
    cheapestStore: storeRankings[0] ?? null,
    summary,
  };
}
