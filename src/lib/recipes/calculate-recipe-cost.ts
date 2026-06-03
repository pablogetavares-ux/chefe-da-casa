import {
  normalizeOfferText,
  termsForIngredientName,
  termsMatch,
} from "@/modules/offers/utils/matching";
import { roundMoney } from "@/modules/shopping/services/savings";

export type RecipeCostIngredientInput = {
  name: string;
  quantity: number;
  unit: string;
  optional?: boolean;
};

export type ProductWithMarketPrices = {
  id: string;
  name: string;
  slug: string;
  base_unit: string;
  market_prices: {
    id: string;
    market_name: string;
    price: number;
  }[];
};

export type MatchedIngredient = {
  ingredient: RecipeCostIngredientInput;
  product: ProductWithMarketPrices | null;
  matchScore: number;
};

export type MarketCostLineItem = {
  ingredientName: string;
  productId: string | null;
  productName: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineCost: number;
  estimated: boolean;
};

export type MarketRecipeCost = {
  marketName: string;
  rank: number;
  totalCost: number;
  matchedIngredients: number;
  missingIngredients: number;
  coveragePercent: number;
  vsCheapest: number;
  lineItems: MarketCostLineItem[];
};

export type RecipeCostSummary = {
  ingredientsTotal: number;
  ingredientsMatched: number;
  marketsCompared: number;
  cheapestTotal: number;
  mostExpensiveTotal: number;
  priceSpread: number;
  cheapestMarketName: string | null;
};

export type RecipeCostResult = {
  ingredients: MatchedIngredient[];
  marketRankings: MarketRecipeCost[];
  cheapestMarket: MarketRecipeCost | null;
  summary: RecipeCostSummary;
};

const MIN_PRODUCT_MATCH_SCORE = 1;

const UNIT_NORMALIZE: Record<string, string> = {
  un: "un",
  und: "un",
  unidade: "un",
  pct: "pct",
  pacote: "pct",
  cx: "cx",
  caixa: "cx",
  kg: "kg",
  g: "g",
  grama: "g",
  gramas: "g",
  l: "L",
  litro: "L",
  litros: "L",
  ml: "ml",
  dz: "dz",
  duzia: "dz",
  "col. sopa": "portion",
  "colher de sopa": "portion",
  "col. chá": "portion",
  xicara: "portion",
  xícara: "portion",
  pitada: "portion",
  cacho: "portion",
};

export function normalizeRecipeUnit(unit: string): string {
  const key = normalizeOfferText(unit);
  return UNIT_NORMALIZE[key] ?? key;
}

/** Fator para converter quantidade da receita em unidades do preço do produto. */
export function computeQuantityFactor(
  quantity: number,
  recipeUnit: string,
  productBaseUnit: string,
): { factor: number; estimated: boolean } {
  const r = normalizeRecipeUnit(recipeUnit);
  const p = normalizeRecipeUnit(productBaseUnit);

  if (r === p) return { factor: quantity, estimated: false };
  if (r === "g" && p === "kg")
    return { factor: quantity / 1000, estimated: false };
  if (r === "ml" && p === "L")
    return { factor: quantity / 1000, estimated: false };
  if (r === "kg" && p === "g")
    return { factor: quantity * 1000, estimated: false };
  if (r === "un" && p === "dz")
    return { factor: quantity / 12, estimated: true };
  if (r === "portion" || p === "portion") {
    return { factor: Math.min(quantity * 0.05, 1), estimated: true };
  }

  return { factor: quantity, estimated: true };
}

export function scoreProductForIngredient(
  ingredientName: string,
  product: Pick<ProductWithMarketPrices, "name" | "slug">,
): number {
  const terms = termsForIngredientName(ingredientName);
  const texts = [product.name, product.slug.replace(/-/g, " ")];
  let score = 0;

  for (const term of terms) {
    if (texts.some((text) => termsMatch(term, normalizeOfferText(text)))) {
      score += 1;
    }
  }

  return score;
}

export function matchIngredientsToProducts(
  ingredients: RecipeCostIngredientInput[],
  products: ProductWithMarketPrices[],
): MatchedIngredient[] {
  return ingredients
    .filter((ing) => !ing.optional)
    .map((ingredient) => {
      let best: ProductWithMarketPrices | null = null;
      let bestScore = 0;

      for (const product of products) {
        const score = scoreProductForIngredient(ingredient.name, product);
        if (score > bestScore) {
          bestScore = score;
          best = product;
        }
      }

      return {
        ingredient,
        product: bestScore >= MIN_PRODUCT_MATCH_SCORE ? best : null,
        matchScore: bestScore,
      };
    });
}

export function collectMarketNames(matched: MatchedIngredient[]): string[] {
  const names = new Set<string>();
  for (const row of matched) {
    for (const price of row.product?.market_prices ?? []) {
      names.add(price.market_name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function buildMarketRecipeCostRankings(
  matched: MatchedIngredient[],
): MarketRecipeCost[] {
  const markets = collectMarketNames(matched);
  if (markets.length === 0) return [];

  const rankings: MarketRecipeCost[] = markets.map((marketName) => {
    const lineItems: MarketCostLineItem[] = [];
    let matchedCount = 0;

    for (const row of matched) {
      const { ingredient, product } = row;
      if (!product) {
        lineItems.push({
          ingredientName: ingredient.name,
          productId: null,
          productName: null,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          unitPrice: 0,
          lineCost: 0,
          estimated: false,
        });
        continue;
      }

      const priceRow = product.market_prices.find(
        (p) => p.market_name === marketName,
      );

      if (!priceRow) {
        lineItems.push({
          ingredientName: ingredient.name,
          productId: product.id,
          productName: product.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          unitPrice: 0,
          lineCost: 0,
          estimated: false,
        });
        continue;
      }

      const { factor, estimated } = computeQuantityFactor(
        ingredient.quantity,
        ingredient.unit,
        product.base_unit,
      );
      const lineCost = roundMoney(Number(priceRow.price) * factor);
      matchedCount += 1;

      lineItems.push({
        ingredientName: ingredient.name,
        productId: product.id,
        productName: product.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitPrice: Number(priceRow.price),
        lineCost,
        estimated,
      });
    }

    const totalCost = roundMoney(
      lineItems.reduce((sum, line) => sum + line.lineCost, 0),
    );
    const missingIngredients = matched.length - matchedCount;

    return {
      marketName,
      rank: 0,
      totalCost,
      matchedIngredients: matchedCount,
      missingIngredients,
      coveragePercent: roundMoney(
        (matchedCount / Math.max(matched.length, 1)) * 100,
      ),
      vsCheapest: 0,
      lineItems,
    };
  });

  rankings.sort((a, b) => {
    if (b.coveragePercent !== a.coveragePercent) {
      return b.coveragePercent - a.coveragePercent;
    }
    return a.totalCost - b.totalCost;
  });

  const cheapestTotal = rankings[0]?.totalCost ?? 0;

  return rankings.map((market, index) => ({
    ...market,
    rank: index + 1,
    vsCheapest: roundMoney(Math.max(0, market.totalCost - cheapestTotal)),
  }));
}

export function buildRecipeCostSummary(
  matched: MatchedIngredient[],
  rankings: MarketRecipeCost[],
): RecipeCostSummary {
  const ingredientsMatched = matched.filter((m) => m.product).length;
  const totals = rankings.map((r) => r.totalCost);
  const cheapestTotal = totals[0] ?? 0;
  const mostExpensiveTotal = totals[totals.length - 1] ?? 0;

  return {
    ingredientsTotal: matched.length,
    ingredientsMatched,
    marketsCompared: rankings.length,
    cheapestTotal,
    mostExpensiveTotal,
    priceSpread: roundMoney(Math.max(0, mostExpensiveTotal - cheapestTotal)),
    cheapestMarketName: rankings[0]?.marketName ?? null,
  };
}

export function calculateRecipeCost(
  ingredients: RecipeCostIngredientInput[],
  products: ProductWithMarketPrices[],
): RecipeCostResult {
  const matched = matchIngredientsToProducts(ingredients, products);
  const marketRankings = buildMarketRecipeCostRankings(matched);
  const summary = buildRecipeCostSummary(matched, marketRankings);

  return {
    ingredients: matched,
    marketRankings,
    cheapestMarket: marketRankings[0] ?? null,
    summary,
  };
}
