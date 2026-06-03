import type { SupabaseClient } from "@supabase/supabase-js";

import {
  attachCacheKey,
  buildAiPromptSnapshot,
  buildCacheKey,
} from "@/lib/ai/core/cache";
import { createStructuredCompletion } from "@/lib/ai/core/completion";
import {
  getModeDietaryDefaults,
  getModeRecipeTag,
} from "@/lib/ai/constants/recipe-modes";
import { isAiMockEnabled, mockGenerateRecipe } from "@/lib/ai/mock";
import { PROMPT_TEMPLATES } from "@/lib/ai/prompts";
import {
  generatedRecipeSchema,
  GENERATED_RECIPE_JSON_SCHEMA,
  type GeneratedRecipe,
} from "@/lib/ai/schemas/recipe-output";
import {
  insertAiGeneration,
  insertUsageLog,
  updateAiGeneration,
} from "@/lib/supabase/service-records";
import type { Database } from "@/types/database";
import type { GenerateRecipeInput } from "@/lib/validations";

export type GenerateRecipeParams = GenerateRecipeInput;

export type GenerateRecipeResult = {
  recipe: GeneratedRecipe;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
};

export async function generateRecipeWithAI(
  params: GenerateRecipeParams,
): Promise<GenerateRecipeResult> {
  const mode = params.mode ?? "STANDARD";
  const dietaryPreferences = [
    ...new Set([
      ...getModeDietaryDefaults(mode),
      ...(params.dietaryPreferences ?? []),
    ]),
  ];

  if (isAiMockEnabled()) {
    return mockGenerateRecipe(params);
  }

  const result = await createStructuredCompletion({
    system: PROMPT_TEMPLATES.recipeGeneration.system(mode),
    user: PROMPT_TEMPLATES.recipeGeneration.user(params.ingredients, {
      preferences: dietaryPreferences.join(", "),
      servings: params.servings,
      maxPrepTimeMinutes: params.maxPrepTimeMinutes,
      mode,
      fitnessGoals: params.fitnessGoals,
      preparationStyle: params.preparationStyle,
    }),
    schema: GENERATED_RECIPE_JSON_SCHEMA,
    zodSchema: generatedRecipeSchema,
  });

  return {
    recipe: result.data,
    model: result.model,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
    totalTokens: result.totalTokens,
    latencyMs: result.latencyMs,
  };
}

export function getGenerateCacheKey(params: GenerateRecipeParams) {
  return buildCacheKey("generate_recipe", {
    ingredients: [...params.ingredients].sort(),
    dietaryPreferences: [...(params.dietaryPreferences ?? [])].sort(),
    servings: params.servings ?? 4,
    maxPrepTimeMinutes: params.maxPrepTimeMinutes ?? null,
    mode: params.mode ?? "STANDARD",
    fitnessGoals: params.fitnessGoals ?? null,
    preparationStyle: params.preparationStyle ?? null,
  });
}

export async function saveGeneratedRecipe(
  supabase: SupabaseClient<Database>,
  userId: string,
  params: GenerateRecipeParams,
  result: GenerateRecipeResult,
  generationId: string,
) {
  const cacheKey = getGenerateCacheKey(params);
  const mode = params.mode ?? "STANDARD";

  const promptSnapshot = buildAiPromptSnapshot(params, result.recipe, mode);

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: userId,
      title: result.recipe.title,
      description: result.recipe.description,
      ingredients: result.recipe.ingredients,
      instructions: result.recipe.instructions,
      prep_time_minutes: result.recipe.prepTimeMinutes,
      cook_time_minutes: result.recipe.cookTimeMinutes,
      servings: result.recipe.servings,
      difficulty: result.recipe.difficulty,
      tags: [...result.recipe.tags, getModeRecipeTag(mode)],
      dietary_tags: result.recipe.dietaryTags,
      is_ai_generated: true,
      ai_prompt_snapshot: promptSnapshot,
    })
    .select("*")
    .single();

  if (recipeError || !recipe) {
    throw new Error(recipeError?.message ?? "Erro ao salvar receita");
  }

  await Promise.all([
    updateAiGeneration(generationId, {
      status: "COMPLETED",
      recipe_id: recipe.id,
      model: result.model,
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.totalTokens,
      output_snapshot: result.recipe,
      latency_ms: result.latencyMs,
      input_snapshot: attachCacheKey(params, cacheKey),
    }),
    insertUsageLog(userId, "ai.generate_recipe", {
      recipe_id: recipe.id,
      generation_id: generationId,
      tokens: result.totalTokens,
      mode,
      cached: false,
    }),
  ]);

  return recipe;
}

export async function markGenerationFailed(
  _supabase: SupabaseClient<Database>,
  generationId: string,
  message: string,
) {
  await updateAiGeneration(generationId, {
    status: "FAILED",
    error_message: message,
  });
}

export async function createPendingGeneration(
  _supabase: SupabaseClient<Database>,
  userId: string,
  input: GenerateRecipeParams,
  action = "ai.generate_recipe",
) {
  const cacheKey = getGenerateCacheKey(input);

  return insertAiGeneration({
    user_id: userId,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    status: "PENDING",
    input_snapshot: attachCacheKey({ ...input, action }, cacheKey),
  });
}
