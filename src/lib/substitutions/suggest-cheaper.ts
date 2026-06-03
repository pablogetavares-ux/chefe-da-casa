import {
  normalizeOfferText,
  termsForIngredientName,
  termsMatch,
} from "@/modules/offers/utils/matching";
import {
  computeQuantityFactor,
  matchIngredientsToProducts,
  scoreProductForIngredient,
  type ProductWithMarketPrices,
  type RecipeCostIngredientInput,
  type RecipeCostResult,
} from "@/lib/recipes/calculate-recipe-cost";
import { roundMoney } from "@/modules/shopping/services/savings";

export type SubstitutionRuleRow = {
  id: string;
  original_name: string;
  substitute_name: string;
  reason: string;
  original_product_id: string | null;
  substitute_product_id: string | null;
};

export type SubstitutionConfidence = "rule" | "catalog";

export type IngredientSubstitutionSuggestion = {
  id: string;
  originalName: string;
  substituteName: string;
  reason: string;
  ingredientName: string;
  originalProductId: string | null;
  substituteProductId: string | null;
  originalProductName: string | null;
  substituteProductName: string | null;
  estimatedSavingsPerLine: number | null;
  cheapestMarketName: string | null;
  confidence: SubstitutionConfidence;
};

export function ingredientMatchesRule(
  ingredientName: string,
  ruleOriginalName: string,
): boolean {
  const terms = termsForIngredientName(ingredientName);
  const ruleNorm = normalizeOfferText(ruleOriginalName);

  return terms.some(
    (term) =>
      termsMatch(term, ruleNorm) ||
      termsMatch(ruleOriginalName, ingredientName),
  );
}

export function findRulesForIngredient(
  ingredientName: string,
  rules: SubstitutionRuleRow[],
): SubstitutionRuleRow[] {
  return rules.filter((rule) =>
    ingredientMatchesRule(ingredientName, rule.original_name),
  );
}

function productById(
  products: ProductWithMarketPrices[],
  id: string | null,
): ProductWithMarketPrices | null {
  if (!id) return null;
  return products.find((p) => p.id === id) ?? null;
}

function cheapestLineCost(
  ingredient: RecipeCostIngredientInput,
  product: ProductWithMarketPrices,
  marketName?: string,
): { lineCost: number; marketName: string | null } {
  if (product.market_prices.length === 0) {
    return { lineCost: 0, marketName: null };
  }

  let bestMarket: string | null = null;
  let bestCost = Number.POSITIVE_INFINITY;

  for (const priceRow of product.market_prices) {
    if (marketName && priceRow.market_name !== marketName) continue;
    const price = Number(priceRow.price);
    if (!Number.isFinite(price) || price <= 0) continue;

    const { factor } = computeQuantityFactor(
      ingredient.quantity,
      ingredient.unit,
      product.base_unit,
    );
    const lineCost = roundMoney(price * factor);
    if (lineCost < bestCost) {
      bestCost = lineCost;
      bestMarket = priceRow.market_name;
    }
  }

  return {
    lineCost: bestCost === Number.POSITIVE_INFINITY ? 0 : bestCost,
    marketName: bestMarket,
  };
}

function resolveOriginalProduct(
  ingredient: RecipeCostIngredientInput,
  rule: SubstitutionRuleRow,
  products: ProductWithMarketPrices[],
): ProductWithMarketPrices | null {
  if (rule.original_product_id) {
    return productById(products, rule.original_product_id);
  }

  let best: ProductWithMarketPrices | null = null;
  let bestScore = 0;

  for (const product of products) {
    const score = scoreProductForIngredient(ingredient.name, product);
    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }

  return bestScore >= 1 ? best : null;
}

function buildSuggestionForRule(
  ingredient: RecipeCostIngredientInput,
  rule: SubstitutionRuleRow,
  products: ProductWithMarketPrices[],
  marketName?: string,
): IngredientSubstitutionSuggestion | null {
  const substituteProduct = rule.substitute_product_id
    ? productById(products, rule.substitute_product_id)
    : (products.find(
        (p) =>
          scoreProductForIngredient(rule.substitute_name, p) >= 1 ||
          termsMatch(rule.substitute_name, p.name),
      ) ?? null);

  const originalProduct = resolveOriginalProduct(ingredient, rule, products);

  let estimatedSavingsPerLine: number | null = null;
  let cheapestMarketName: string | null = null;
  let confidence: SubstitutionConfidence = "rule";

  if (substituteProduct) {
    const originalCost = originalProduct
      ? cheapestLineCost(ingredient, originalProduct, marketName)
      : { lineCost: 0, marketName: null };
    const substituteCost = cheapestLineCost(
      ingredient,
      substituteProduct,
      marketName,
    );

    if (originalCost.lineCost > 0 && substituteCost.lineCost > 0) {
      const savings = roundMoney(
        originalCost.lineCost - substituteCost.lineCost,
      );
      if (savings > 0) {
        estimatedSavingsPerLine = savings;
        cheapestMarketName =
          substituteCost.marketName ?? originalCost.marketName;
        confidence = "catalog";
      } else if (substituteCost.lineCost <= originalCost.lineCost) {
        cheapestMarketName = substituteCost.marketName;
        confidence = "catalog";
      }
    } else if (substituteCost.lineCost > 0) {
      cheapestMarketName = substituteCost.marketName;
      confidence = "catalog";
    }
  }

  return {
    id: rule.id,
    originalName: rule.original_name,
    substituteName: rule.substitute_name,
    reason: rule.reason,
    ingredientName: ingredient.name,
    originalProductId: originalProduct?.id ?? rule.original_product_id,
    substituteProductId: substituteProduct?.id ?? rule.substitute_product_id,
    originalProductName: originalProduct?.name ?? null,
    substituteProductName: substituteProduct?.name ?? rule.substitute_name,
    estimatedSavingsPerLine,
    cheapestMarketName,
    confidence,
  };
}

export function suggestSubstitutionsForIngredients(
  ingredients: RecipeCostIngredientInput[],
  rules: SubstitutionRuleRow[],
  products: ProductWithMarketPrices[],
  options?: { marketName?: string },
): IngredientSubstitutionSuggestion[] {
  const suggestions: IngredientSubstitutionSuggestion[] = [];
  const seen = new Set<string>();

  for (const ingredient of ingredients.filter((i) => !i.optional)) {
    const matchedRules = findRulesForIngredient(ingredient.name, rules);

    for (const rule of matchedRules) {
      const key = `${normalizeOfferText(ingredient.name)}::${rule.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const suggestion = buildSuggestionForRule(
        ingredient,
        rule,
        products,
        options?.marketName,
      );
      if (suggestion) suggestions.push(suggestion);
    }
  }

  suggestions.sort((a, b) => {
    const sa = a.estimatedSavingsPerLine ?? 0;
    const sb = b.estimatedSavingsPerLine ?? 0;
    return sb - sa;
  });

  return suggestions;
}

export function totalEstimatedSavings(
  suggestions: IngredientSubstitutionSuggestion[],
): number {
  return roundMoney(
    suggestions.reduce((sum, s) => sum + (s.estimatedSavingsPerLine ?? 0), 0),
  );
}

/** Reaplica matches forçando produto substituto quando há ID no catálogo. */
export function matchIngredientsWithSubstitutions(
  ingredients: RecipeCostIngredientInput[],
  products: ProductWithMarketPrices[],
  suggestions: IngredientSubstitutionSuggestion[],
): ReturnType<typeof matchIngredientsToProducts> {
  const base = matchIngredientsToProducts(ingredients, products);

  return base.map((row) => {
    const suggestion = suggestions.find((s) =>
      ingredientMatchesRule(row.ingredient.name, s.originalName),
    );
    if (!suggestion?.substituteProductId) return row;

    const substitute = productById(products, suggestion.substituteProductId);
    if (!substitute) return row;

    const score = scoreProductForIngredient(row.ingredient.name, substitute);

    return {
      ingredient: row.ingredient,
      product: substitute,
      matchScore: Math.max(row.matchScore, score, 1),
    };
  });
}

export type RecipeCostWithSubstitutions = {
  base: RecipeCostResult;
  optimized: RecipeCostResult | null;
  suggestions: IngredientSubstitutionSuggestion[];
  estimatedTotalSavings: number;
};
