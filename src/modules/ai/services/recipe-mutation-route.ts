import type { z } from "zod";

import { assertAiGenerationAllowed } from "@/lib/ai/limits";
import { buildAiPromptSnapshot } from "@/lib/ai/core/cache";
import type { GeneratedRecipe } from "@/lib/ai/schemas/recipe-output";
import {
  assertAiRateLimit,
  ensureOpenAiConfigured,
  mapAiRouteError,
} from "@/lib/ai/route-utils";
import { createAuthClient, requireAuthUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  insertAiGeneration,
  insertUsageLog,
} from "@/lib/supabase/service-records";
import type { Json, Tables } from "@/types/database";

type RecipeRow = Tables<"recipes">;

type AiCompletionResult<T> = {
  data: T;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
};

export async function handleAiRecipeFullUpdate<
  TInput extends { recipeId: string },
>(
  request: Request,
  options: {
    schema: z.ZodType<TInput>;
    operation: "ADAPT" | "REFINE";
    usageAction: string;
    markAiGenerated?: boolean;
    run: (
      recipe: RecipeRow,
      input: TInput,
    ) => Promise<AiCompletionResult<GeneratedRecipe>>;
  },
) {
  try {
    const user = await requireAuthUser(request);
    await assertAiRateLimit(user.id);
    ensureOpenAiConfigured();

    const body = await request.json();
    const parsed = options.schema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const usage = await assertAiGenerationAllowed(user.id);
    const supabase = await createAuthClient(request);

    const { data: existing } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", parsed.data.recipeId)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return apiError("Receita não encontrada", 404, "RECIPE_NOT_FOUND");
    }

    const result = await options.run(existing, parsed.data);
    const promptSnapshot = buildAiPromptSnapshot(
      parsed.data,
      result.data,
      options.operation,
    );

    const { data: recipe, error } = await supabase
      .from("recipes")
      .update({
        title: result.data.title,
        description: result.data.description,
        ingredients: result.data.ingredients as Json,
        instructions: result.data.instructions as Json,
        prep_time_minutes: result.data.prepTimeMinutes,
        cook_time_minutes: result.data.cookTimeMinutes,
        servings: result.data.servings,
        difficulty: result.data.difficulty,
        tags: result.data.tags,
        dietary_tags: result.data.dietaryTags,
        ...(options.markAiGenerated !== false ? { is_ai_generated: true } : {}),
        ai_prompt_snapshot: promptSnapshot,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error || !recipe) {
      return apiError(error?.message ?? "Erro ao atualizar receita", 500);
    }

    await insertAiGeneration({
      user_id: user.id,
      recipe_id: recipe.id,
      model: result.model,
      status: "COMPLETED",
      input_snapshot: parsed.data as Json,
      output_snapshot: result.data as Json,
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.totalTokens,
      latency_ms: result.latencyMs,
    });

    await insertUsageLog(user.id, options.usageAction, {
      recipe_id: recipe.id,
      tokens: result.totalTokens,
    });

    return apiSuccess({
      recipe,
      usage: {
        used: usage.used + 1,
        limit: usage.limit,
        remaining: Math.max(usage.remaining - 1, 0),
      },
    });
  } catch (error) {
    return mapAiRouteError(error);
  }
}

export async function handleAiRecipeMetadataUpdate<
  TInput extends { recipeId: string },
  TOutput extends Json,
>(
  request: Request,
  options: {
    schema: z.ZodType<TInput>;
    usageAction: string;
    run: (
      recipe: RecipeRow,
      input: TInput,
    ) => Promise<AiCompletionResult<TOutput>>;
    mergeSnapshot: (
      existingMeta: Record<string, unknown>,
      result: TOutput,
    ) => Record<string, unknown>;
    buildResponse: (
      result: TOutput,
      usage: Awaited<ReturnType<typeof assertAiGenerationAllowed>>,
    ) => Record<string, unknown>;
  },
) {
  try {
    const user = await requireAuthUser(request);
    await assertAiRateLimit(user.id);
    ensureOpenAiConfigured();

    const body = await request.json();
    const parsed = options.schema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const usage = await assertAiGenerationAllowed(user.id);
    const supabase = await createAuthClient(request);

    const { data: recipe } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", parsed.data.recipeId)
      .eq("user_id", user.id)
      .single();

    if (!recipe) {
      return apiError("Receita não encontrada", 404, "RECIPE_NOT_FOUND");
    }

    const result = await options.run(recipe, parsed.data);

    let aiMeta: Record<string, unknown> = {};
    if (recipe.ai_prompt_snapshot) {
      try {
        aiMeta = JSON.parse(recipe.ai_prompt_snapshot) as Record<
          string,
          unknown
        >;
      } catch {
        aiMeta = {};
      }
    }

    const { error: snapshotError } = await supabase
      .from("recipes")
      .update({
        ai_prompt_snapshot: JSON.stringify(
          options.mergeSnapshot(aiMeta, result.data),
        ),
      })
      .eq("id", recipe.id);

    if (snapshotError) {
      throw new Error(snapshotError.message);
    }

    await insertAiGeneration({
      user_id: user.id,
      recipe_id: recipe.id,
      model: result.model,
      status: "COMPLETED",
      input_snapshot: parsed.data as Json,
      output_snapshot: result.data,
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.totalTokens,
      latency_ms: result.latencyMs,
    });

    await insertUsageLog(user.id, options.usageAction, {
      recipe_id: recipe.id,
      tokens: result.totalTokens,
    });

    return apiSuccess({
      ...options.buildResponse(result.data, usage),
      usage: {
        used: usage.used + 1,
        limit: usage.limit,
        remaining: Math.max(usage.remaining - 1, 0),
      },
    });
  } catch (error) {
    return mapAiRouteError(error);
  }
}
