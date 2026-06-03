import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { findCachedRecipeGeneration } from "@/lib/ai/core/cache";
import {
  assertAiGenerationAllowed,
  assertRecipesPerMonthLimit,
} from "@/lib/billing/plan-limits";
import {
  assertAiRateLimit,
  ensureOpenAiConfigured,
  mapAiRouteError,
} from "@/lib/ai/route-utils";
import {
  createPendingGeneration,
  generateRecipeWithAI,
  getGenerateCacheKey,
  markGenerationFailed,
  saveGeneratedRecipe,
} from "@/lib/ai/services/generate";
import {
  extractIngredientNames,
  scanIngredientsFromImage,
} from "@/lib/ai/services/scan";
import { resolveScanImageUrl } from "@/lib/ai/services/scan-utils";
import { createClient } from "@/lib/supabase/server";
import {
  insertIngredientScan,
  insertUsageLog,
} from "@/lib/supabase/service-records";
import { scanAndGenerateSchema } from "@/lib/validations";
import { enrichGenerateRecipeInput } from "@/lib/fitness/resolve-fitness-goals";
import { getProfileBodyFields } from "@/lib/queries/profile-fitness";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let generationId: string | null = null;

  try {
    const user = await requireAuthUser();
    await assertAiRateLimit(user.id);
    ensureOpenAiConfigured();

    const body = await request.json();
    const parsed = scanAndGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const usage = await assertAiGenerationAllowed(user.id);
    await assertRecipesPerMonthLimit(user.id);
    const supabase = await createClient();

    const { imageUrl, storagePath } = await resolveScanImageUrl(
      supabase,
      user.id,
      parsed.data,
    );

    let scanResult;
    try {
      scanResult = await scanIngredientsFromImage(
        imageUrl,
        parsed.data.context,
      );
    } catch {
      throw new Error("SCAN_FAILED");
    }

    const ingredientNames = extractIngredientNames(scanResult.data);
    if (ingredientNames.length === 0) {
      throw new Error("SCAN_FAILED");
    }

    await insertIngredientScan({
      user_id: user.id,
      storage_path: storagePath ?? "inline-base64",
      detected_ingredients: scanResult.data.ingredients,
      scene_description: scanResult.data.sceneDescription,
    });

    const generateInput = enrichGenerateRecipeInput(
      {
        ingredients: ingredientNames,
        dietaryPreferences: parsed.data.dietaryPreferences,
        servings: parsed.data.servings,
        maxPrepTimeMinutes: parsed.data.maxPrepTimeMinutes,
        mode: parsed.data.mode,
        forceRegenerate: parsed.data.forceRegenerate,
        fitnessGoals: parsed.data.fitnessGoals,
      },
      await getProfileBodyFields(supabase, user.id),
    );

    const cacheKey = getGenerateCacheKey(generateInput);

    if (!parsed.data.forceRegenerate) {
      const cached = await findCachedRecipeGeneration(user.id, cacheKey);
      if (cached) {
        return apiSuccess({
          recipe: cached.recipe,
          generationId: cached.generationId,
          cached: true,
          scan: {
            ingredientNames,
            sceneDescription: scanResult.data.sceneDescription,
            suggestions: scanResult.data.suggestions,
          },
          usage: {
            used: usage.used,
            limit: usage.limit,
            remaining: usage.remaining,
          },
        });
      }
    }

    const pendingId = await createPendingGeneration(
      supabase,
      user.id,
      generateInput,
      "ai.scan_and_generate",
    );
    generationId = pendingId;

    const aiResult = await generateRecipeWithAI(generateInput);
    const recipe = await saveGeneratedRecipe(
      supabase,
      user.id,
      generateInput,
      aiResult,
      pendingId,
    );

    await insertUsageLog(user.id, "ai.scan_ingredients", {
      ingredient_count: ingredientNames.length,
      tokens: scanResult.totalTokens,
      combined: true,
    });

    return apiSuccess({
      recipe,
      generationId,
      cached: false,
      scan: {
        ingredientNames,
        sceneDescription: scanResult.data.sceneDescription,
        suggestions: scanResult.data.suggestions,
      },
      usage: {
        used: usage.used + 1,
        limit: usage.limit,
        remaining: Math.max(usage.remaining - 1, 0),
      },
    });
  } catch (error) {
    if (generationId) {
      const supabase = await createClient();
      await markGenerationFailed(
        supabase,
        generationId,
        error instanceof Error ? error.message : "Erro desconhecido",
      );
    }
    return mapAiRouteError(error);
  }
}
