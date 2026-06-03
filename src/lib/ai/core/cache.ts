import { createClient } from "@/lib/supabase/server";
import { hashAiInput } from "@/lib/ai/core/hash-input";
import type { GeneratedRecipe } from "@/lib/ai/schemas/recipe-output";
import type { Recipe } from "@/types/database";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type CachedGenerationHit = {
  recipe: Recipe;
  generationId: string;
  cacheKey: string;
  cached: true;
};

export function buildCacheKey(action: string, input: unknown) {
  return `${action}:${hashAiInput(input)}`;
}

export async function findCachedRecipeGeneration(
  userId: string,
  cacheKey: string,
): Promise<CachedGenerationHit | null> {
  const supabase = await createClient();
  const since = new Date(Date.now() - CACHE_TTL_MS).toISOString();

  const { data: generations } = await supabase
    .from("ai_generations")
    .select("id, recipe_id, input_snapshot, created_at")
    .eq("user_id", userId)
    .eq("status", "COMPLETED")
    .gte("created_at", since)
    .not("recipe_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!generations?.length) return null;

  const match = generations.find((generation) => {
    const snapshot = generation.input_snapshot as {
      _cacheKey?: string;
    } | null;
    return snapshot?._cacheKey === cacheKey;
  });

  if (!match?.recipe_id) return null;

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", match.recipe_id)
    .eq("user_id", userId)
    .single();

  if (!recipe) return null;

  return {
    recipe,
    generationId: match.id,
    cacheKey,
    cached: true,
  };
}

export function attachCacheKey<T extends Record<string, unknown>>(
  input: T,
  cacheKey: string,
) {
  return { ...input, _cacheKey: cacheKey };
}

export type RecipeAiMetadata = {
  mode?: string;
  nutrition?: GeneratedRecipe["nutrition"];
  substitutions?: GeneratedRecipe["substitutions"];
  costTier?: GeneratedRecipe["costTier"];
  estimatedCostPerServing?: number | null;
};

export function parseRecipeAiMetadata(
  aiPromptSnapshot: string | null,
): RecipeAiMetadata | null {
  if (!aiPromptSnapshot) return null;

  try {
    const parsed = JSON.parse(aiPromptSnapshot) as RecipeAiMetadata & {
      input?: unknown;
    };
    return {
      mode: parsed.mode,
      nutrition: parsed.nutrition,
      substitutions: parsed.substitutions,
      costTier: parsed.costTier,
      estimatedCostPerServing: parsed.estimatedCostPerServing,
    };
  } catch {
    return null;
  }
}

export function buildAiPromptSnapshot(
  input: unknown,
  recipe: Pick<
    GeneratedRecipe,
    "nutrition" | "substitutions" | "costTier" | "estimatedCostPerServing"
  >,
  mode?: string,
) {
  return JSON.stringify({
    input,
    mode,
    nutrition: recipe.nutrition,
    substitutions: recipe.substitutions,
    costTier: recipe.costTier,
    estimatedCostPerServing: recipe.estimatedCostPerServing,
  });
}
