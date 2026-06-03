import {
  buildMarketRecipeCostRankings,
  buildRecipeCostSummary,
  computeQuantityFactor,
  matchIngredientsToProducts,
  type MarketRecipeCost,
  type ProductWithMarketPrices,
  type RecipeCostIngredientInput,
} from "@/lib/recipes/calculate-recipe-cost";
import { roundMoney } from "@/modules/shopping/services/savings";

export type ShoppingListCompareItem = {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
};

export type MarketPriceCell = {
  marketName: string;
  unitPrice: number | null;
  lineCost: number;
  available: boolean;
  estimated: boolean;
};

export type ComparisonTableRow = {
  itemId?: string;
  itemName: string;
  quantity: number;
  unit: string;
  productId: string | null;
  productName: string | null;
  matchScore: number;
  pricesByMarket: MarketPriceCell[];
  cheapestMarket: string | null;
  cheapestLineCost: number;
  priceSpread: number;
};

export type MarketRankingRow = MarketRecipeCost & {
  isBest: boolean;
};

export type MarketsCompareSummary = {
  itemsTotal: number;
  itemsMatched: number;
  marketsCompared: number;
  cheapestTotal: number;
  mostExpensiveTotal: number;
  averageTotal: number;
  priceSpread: number;
  cheapestMarketName: string | null;
  savingsVsMostExpensive: number;
  savingsVsAverage: number;
};

export type MarketsCompareResult = {
  listId: string | null;
  markets: string[];
  comparisonTable: ComparisonTableRow[];
  rankings: MarketRankingRow[];
  bestMarket: MarketRankingRow | null;
  summary: MarketsCompareSummary;
};

function toIngredientInput(
  item: ShoppingListCompareItem,
): RecipeCostIngredientInput {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
  };
}

export function buildComparisonTable(
  items: ShoppingListCompareItem[],
  products: ProductWithMarketPrices[],
  markets: string[],
): ComparisonTableRow[] {
  const matched = matchIngredientsToProducts(
    items.map(toIngredientInput),
    products,
  );

  return items.map((item, index) => {
    const row = matched[index];
    const product = row?.product ?? null;
    const quantity = item.quantity;
    const unit = item.unit;

    const pricesByMarket: MarketPriceCell[] = markets.map((marketName) => {
      if (!product) {
        return {
          marketName,
          unitPrice: null,
          lineCost: 0,
          available: false,
          estimated: false,
        };
      }

      const priceRow = product.market_prices.find(
        (p) => p.market_name === marketName,
      );

      if (!priceRow) {
        return {
          marketName,
          unitPrice: null,
          lineCost: 0,
          available: false,
          estimated: false,
        };
      }

      const { factor, estimated } = computeQuantityFactor(
        quantity,
        unit,
        product.base_unit,
      );

      return {
        marketName,
        unitPrice: Number(priceRow.price),
        lineCost: roundMoney(Number(priceRow.price) * factor),
        available: true,
        estimated,
      };
    });

    const availableCells = pricesByMarket.filter((c) => c.available);
    const sorted = [...availableCells].sort((a, b) => a.lineCost - b.lineCost);
    const cheapest = sorted[0];
    const expensive = sorted[sorted.length - 1];

    return {
      itemId: item.id,
      itemName: item.name,
      quantity,
      unit,
      productId: product?.id ?? null,
      productName: product?.name ?? null,
      matchScore: row?.matchScore ?? 0,
      pricesByMarket,
      cheapestMarket: cheapest?.marketName ?? null,
      cheapestLineCost: cheapest?.lineCost ?? 0,
      priceSpread: roundMoney(
        Math.max(0, (expensive?.lineCost ?? 0) - (cheapest?.lineCost ?? 0)),
      ),
    };
  });
}

export function compareMarketsForShoppingList(
  items: ShoppingListCompareItem[],
  products: ProductWithMarketPrices[],
  listId: string | null = null,
): MarketsCompareResult {
  const ingredients = items.map(toIngredientInput);
  const matched = matchIngredientsToProducts(ingredients, products);
  const baseRankings = buildMarketRecipeCostRankings(matched);
  const baseSummary = buildRecipeCostSummary(matched, baseRankings);

  const markets = baseRankings.map((r) => r.marketName);
  const comparisonTable = buildComparisonTable(items, products, markets);

  const totals = baseRankings.map((r) => r.totalCost);
  const cheapestTotal = totals[0] ?? 0;
  const mostExpensiveTotal = totals[totals.length - 1] ?? 0;
  const averageTotal =
    totals.length > 0
      ? roundMoney(totals.reduce((s, v) => s + v, 0) / totals.length)
      : 0;

  const rankings: MarketRankingRow[] = baseRankings.map((market, index) => ({
    ...market,
    isBest: index === 0,
  }));

  const bestMarket = rankings[0] ?? null;

  return {
    listId,
    markets,
    comparisonTable,
    rankings,
    bestMarket,
    summary: {
      itemsTotal: baseSummary.ingredientsTotal,
      itemsMatched: baseSummary.ingredientsMatched,
      marketsCompared: baseSummary.marketsCompared,
      cheapestTotal,
      mostExpensiveTotal,
      averageTotal,
      priceSpread: baseSummary.priceSpread,
      cheapestMarketName: baseSummary.cheapestMarketName,
      savingsVsMostExpensive: roundMoney(
        Math.max(0, mostExpensiveTotal - cheapestTotal),
      ),
      savingsVsAverage: roundMoney(Math.max(0, averageTotal - cheapestTotal)),
    },
  };
}
