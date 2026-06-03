import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildMarketRecipeCostRankings,
  buildRecipeCostSummary,
  calculateRecipeCost,
  type RecipeCostIngredientInput,
} from "@/lib/recipes/calculate-recipe-cost";
import {
  matchIngredientsWithSubstitutions,
  suggestSubstitutionsForIngredients,
  totalEstimatedSavings,
} from "@/lib/substitutions/suggest-cheaper";
import { loadSubstitutionRules } from "@/lib/substitutions/load-rules";
import {
  getRecipeForCost,
  loadProductsWithPrices,
  RecipeNotFoundError,
  type RecipeCostPayload,
} from "@/modules/recipes/services/recipe-cost";
import type { SubstitutionsResponse } from "@/modules/substitutions/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

function parseRecipeIngredients(raw: unknown): RecipeCostIngredientInput[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const quantity =
        typeof row.quantity === "number" ? row.quantity : Number(row.quantity);
      const unit = typeof row.unit === "string" ? row.unit.trim() : "un";
      const optional = Boolean(row.optional);

      if (!name || !Number.isFinite(quantity) || quantity <= 0) return null;

      return {
        name,
        quantity,
        unit,
        ...(optional ? { optional: true } : {}),
      };
    })
    .filter((row): row is RecipeCostIngredientInput => row !== null);
}

export { loadSubstitutionRules } from "@/lib/substitutions/load-rules";

function toRecipeCostPayload(
  recipeId: string | null,
  recipeTitle: string,
  servings: number,
  result: ReturnType<typeof calculateRecipeCost>,
): RecipeCostPayload {
  const cheapestTotal = result.summary.cheapestTotal;

  return {
    recipeId,
    recipeTitle,
    servings,
    costPerServing:
      cheapestTotal > 0 && servings > 0
        ? Math.round((cheapestTotal / servings) * 100) / 100
        : null,
    ingredients: result.ingredients,
    marketRankings: result.marketRankings,
    cheapestMarket: result.cheapestMarket,
    summary: result.summary,
  };
}

function calculateWithSubstitutionMatches(
  ingredients: RecipeCostIngredientInput[],
  products: Awaited<ReturnType<typeof loadProductsWithPrices>>,
  suggestions: ReturnType<typeof suggestSubstitutionsForIngredients>,
) {
  const matched = matchIngredientsWithSubstitutions(
    ingredients,
    products,
    suggestions,
  );
  const marketRankings = buildMarketRecipeCostRankings(matched);
  const summary = buildRecipeCostSummary(matched, marketRankings);

  return {
    ingredients: matched,
    marketRankings,
    cheapestMarket: marketRankings[0] ?? null,
    summary,
  };
}

export async function computeIntelligentSubstitutions(
  client: Client,
  input: {
    userId: string;
    recipeId?: string;
    title?: string;
    ingredients?: RecipeCostIngredientInput[];
    marketName?: string;
    applySubstitutions?: boolean;
    includeCatalog?: boolean;
  },
): Promise<SubstitutionsResponse> {
  const recipeId = input.recipeId ?? null;
  let recipeTitle: string | null = input.title ?? null;
  let servings = 4;
  let ingredients = input.ingredients ?? [];

  if (recipeId) {
    const recipe = await getRecipeForCost(client, recipeId, input.userId);
    if (!recipe) throw new RecipeNotFoundError();
    recipeTitle = recipe.title;
    servings = recipe.servings ?? servings;
    ingredients = parseRecipeIngredients(recipe.ingredients);
  }

  const [rules, products] = await Promise.all([
    loadSubstitutionRules(client),
    loadProductsWithPrices(client),
  ]);

  const catalog =
    input.includeCatalog !== false
      ? rules.map((row) => ({
          id: row.id,
          originalName: row.original_name,
          substituteName: row.substitute_name,
          reason: row.reason,
          originalProductId: row.original_product_id,
          substituteProductId: row.substitute_product_id,
        }))
      : [];

  const suggestions =
    ingredients.length > 0
      ? suggestSubstitutionsForIngredients(ingredients, rules, products, {
          marketName: input.marketName,
        })
      : [];

  const estimatedTotalSavings = totalEstimatedSavings(suggestions);

  let recipeCost: RecipeCostPayload | null = null;
  let recipeCostWithSubstitutions: RecipeCostPayload | null = null;

  if (ingredients.length > 0) {
    const baseResult = calculateRecipeCost(ingredients, products);
    recipeCost = toRecipeCostPayload(
      recipeId,
      recipeTitle ?? "Receita",
      servings,
      baseResult,
    );

    if (input.applySubstitutions && suggestions.length > 0) {
      const optimized = calculateWithSubstitutionMatches(
        ingredients,
        products,
        suggestions,
      );
      recipeCostWithSubstitutions = toRecipeCostPayload(
        recipeId,
        recipeTitle ?? "Receita",
        servings,
        optimized,
      );
    }
  }

  return {
    catalog,
    suggestions,
    estimatedTotalSavings,
    recipeId,
    recipeTitle,
    recipeCost,
    recipeCostWithSubstitutions,
  };
}

export { RecipeNotFoundError };
