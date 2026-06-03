import type { SupabaseClient } from "@supabase/supabase-js";

import { attachCacheKey, buildCacheKey } from "@/lib/ai/core/cache";
import { createStructuredCompletion } from "@/lib/ai/core/completion";
import { isAiMockEnabled } from "@/lib/ai/mock";
import { mockAntiWasteRecipe } from "@/lib/ai/mock/anti-waste";
import { ANTI_WASTE_PROMPTS } from "@/lib/ai/prompts/anti-waste";
import {
  ANTI_WASTE_RECIPE_JSON_SCHEMA,
  antiWasteRecipeSchema,
  type AntiWasteRecipe,
} from "@/lib/ai/schemas/anti-waste-output";
import type {
  AntiWastePantryItem,
  AntiWasteSummary,
} from "@/lib/queries/anti-waste";
import {
  buildAntiWasteSuggestions,
  classifyPantryForAntiWaste,
  formatPantryItemForPrompt,
} from "@/lib/queries/anti-waste";
import {
  insertAiGeneration,
  insertUsageLog,
  updateAiGeneration,
} from "@/lib/supabase/service-records";
import type { Database } from "@/types/database";
import type { AntiWasteGenerateInput } from "@/lib/validations";

export type AntiWasteGenerateParams = AntiWasteGenerateInput & {
  priorityItems: AntiWastePantryItem[];
  supplementalIngredients?: string[];
};

export type AntiWasteGenerateResult = {
  recipe: AntiWasteRecipe;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
};

export async function fetchAntiWasteSummary(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AntiWasteSummary> {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", userId)
    .order("expires_at", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);

  const items = (data ?? []) as AntiWastePantryItem[];
  const classified = classifyPantryForAntiWaste(items);

  return {
    ...classified,
    suggestions: buildAntiWasteSuggestions(classified.stats),
  };
}

export function selectPriorityItems(
  allItems: AntiWastePantryItem[],
  selectedIds?: string[],
): AntiWastePantryItem[] {
  if (selectedIds?.length) {
    const idSet = new Set(selectedIds);
    return allItems.filter((item) => idSet.has(item.id));
  }

  const classified = classifyPantryForAntiWaste(allItems);
  const byId = new Map<string, AntiWastePantryItem>();

  for (const item of [
    ...classified.expired,
    ...classified.expiringSoon,
    ...classified.leftovers,
  ]) {
    byId.set(item.id, item);
  }

  return [...byId.values()];
}

export function getAntiWasteCacheKey(params: AntiWasteGenerateParams) {
  return buildCacheKey("anti_waste_recipe", {
    itemIds: params.priorityItems.map((i) => i.id).sort(),
    servings: params.servings ?? 4,
    maxPrepTimeMinutes: params.maxPrepTimeMinutes ?? null,
    extraNotes: params.extraNotes ?? null,
    supplementalIngredients: [...(params.supplementalIngredients ?? [])].sort(),
  });
}

export async function generateAntiWasteRecipeWithAI(
  params: AntiWasteGenerateParams,
): Promise<AntiWasteGenerateResult> {
  if (isAiMockEnabled()) {
    return mockAntiWasteRecipe(params);
  }

  const result = await createStructuredCompletion({
    system: ANTI_WASTE_PROMPTS.system,
    user: ANTI_WASTE_PROMPTS.user(params.priorityItems, {
      servings: params.servings,
      maxPrepTimeMinutes: params.maxPrepTimeMinutes,
      extraNotes: params.extraNotes,
      supplementalIngredients: params.supplementalIngredients,
    }),
    schema: ANTI_WASTE_RECIPE_JSON_SCHEMA,
    zodSchema: antiWasteRecipeSchema,
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

export async function saveAntiWasteRecipe(
  supabase: SupabaseClient<Database>,
  userId: string,
  params: AntiWasteGenerateParams,
  result: AntiWasteGenerateResult,
  generationId: string,
) {
  const cacheKey = getAntiWasteCacheKey(params);
  const {
    prioritizedIngredients,
    wasteReductionTips,
    repurposingIdeas,
    ...recipeCore
  } = result.recipe;

  const promptSnapshot = JSON.stringify({
    mode: "ANTI_WASTE",
    items: params.priorityItems.map(formatPantryItemForPrompt),
    prioritizedIngredients,
    wasteReductionTips,
    repurposingIdeas,
    servings: params.servings,
  });

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: userId,
      title: recipeCore.title,
      description: recipeCore.description,
      ingredients: recipeCore.ingredients,
      instructions: recipeCore.instructions,
      prep_time_minutes: recipeCore.prepTimeMinutes,
      cook_time_minutes: recipeCore.cookTimeMinutes,
      servings: recipeCore.servings,
      difficulty: recipeCore.difficulty,
      tags: [...recipeCore.tags, "anti-desperdício", "reaproveitamento"],
      dietary_tags: recipeCore.dietaryTags,
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
    insertUsageLog(userId, "ai.anti_waste", {
      recipe_id: recipe.id,
      generation_id: generationId,
      tokens: result.totalTokens,
      item_count: params.priorityItems.length,
    }),
  ]);

  return {
    recipe,
    wasteReduction: {
      prioritizedIngredients,
      tips: wasteReductionTips,
      repurposingIdeas,
    },
  };
}

export async function createAntiWastePendingGeneration(
  userId: string,
  input: AntiWasteGenerateParams,
) {
  const cacheKey = getAntiWasteCacheKey(input);

  return insertAiGeneration({
    user_id: userId,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    status: "PENDING",
    input_snapshot: attachCacheKey(
      { ...input, action: "ai.anti_waste" },
      cacheKey,
    ),
  });
}

export async function markAntiWasteGenerationFailed(
  generationId: string,
  message: string,
) {
  await updateAiGeneration(generationId, {
    status: "FAILED",
    error_message: message,
  });
}
