import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateRecipeCost,
  type ProductWithMarketPrices,
  type RecipeCostIngredientInput,
  type RecipeCostResult,
} from "@/lib/recipes/calculate-recipe-cost";
import type { IngredientSubstitutionSuggestion } from "@/lib/substitutions/suggest-cheaper";
import {
  suggestSubstitutionsForIngredients,
  totalEstimatedSavings,
} from "@/lib/substitutions/suggest-cheaper";
import { loadSubstitutionRules } from "@/lib/substitutions/load-rules";
import type { RecipeIngredient } from "@/types";
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

export async function loadProductsWithPrices(
  client: Client,
): Promise<ProductWithMarketPrices[]> {
  const { data, error } = await client
    .from("products")
    .select("id, name, slug, base_unit, market_prices(id, market_name, price)")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    base_unit: row.base_unit,
    market_prices: (row.market_prices ?? []).map((p) => ({
      id: p.id,
      market_name: p.market_name,
      price: Number(p.price),
    })),
  }));
}

export async function getRecipeForCost(
  client: Client,
  recipeId: string,
  userId: string,
) {
  const { data, error } = await client
    .from("recipes")
    .select("id, title, servings, ingredients, user_id")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export type RecipeCostPayload = {
  recipeId: string | null;
  recipeTitle: string;
  servings: number;
  costPerServing: number | null;
  ingredients: RecipeCostResult["ingredients"];
  marketRankings: RecipeCostResult["marketRankings"];
  cheapestMarket: RecipeCostResult["cheapestMarket"];
  summary: RecipeCostResult["summary"];
  substitutions?: IngredientSubstitutionSuggestion[];
  estimatedSubstitutionSavings?: number;
};

export async function computeRecipeCostForUser(
  client: Client,
  input: {
    userId: string;
    recipeId?: string;
    title?: string;
    servings?: number;
    ingredients?: RecipeCostIngredientInput[];
    includeSubstitutions?: boolean;
  },
): Promise<RecipeCostPayload> {
  const recipeId = input.recipeId ?? null;
  let recipeTitle = input.title ?? "Receita";
  let servings = input.servings ?? 4;
  let ingredients = input.ingredients ?? [];

  if (recipeId) {
    const recipe = await getRecipeForCost(client, recipeId, input.userId);
    if (!recipe) {
      throw new RecipeNotFoundError();
    }
    recipeTitle = recipe.title;
    servings = recipe.servings ?? servings;
    ingredients = parseRecipeIngredients(recipe.ingredients);
  }

  if (ingredients.length === 0) {
    throw new Error("Receita sem ingredientes para calcular custo");
  }

  const products = await loadProductsWithPrices(client);
  const result = calculateRecipeCost(ingredients, products);
  const cheapestTotal = result.summary.cheapestTotal;

  const payload: RecipeCostPayload = {
    recipeId,
    recipeTitle,
    servings,
    costPerServing:
      cheapestTotal > 0 && servings > 0
        ? Math.round((cheapestTotal / servings) * 100) / 100
        : null,
    ...result,
  };

  if (input.includeSubstitutions) {
    const rules = await loadSubstitutionRules(client);
    const suggestions = suggestSubstitutionsForIngredients(
      ingredients,
      rules,
      products,
    );
    payload.substitutions = suggestions;
    payload.estimatedSubstitutionSavings = totalEstimatedSavings(suggestions);
  }

  return payload;
}

export class RecipeNotFoundError extends Error {
  constructor() {
    super("RECIPE_NOT_FOUND");
    this.name = "RecipeNotFoundError";
  }
}

export function recipeIngredientsFromDomain(
  items: RecipeIngredient[],
): RecipeCostIngredientInput[] {
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    optional: item.optional,
  }));
}
