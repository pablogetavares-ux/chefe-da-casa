import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthenticatedClient } from "@/lib/api/auth";
import { assertPremiumRecipeMode } from "@/lib/billing/assert-premium";
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
import {
  loadRecentScanByStoragePath,
  resolveScanImageUrl,
} from "@/lib/ai/services/scan-utils";
import {
  insertIngredientScan,
  insertUsageLog,
} from "@/lib/supabase/service-records";
import { scanAndGenerateSchema } from "@/lib/validations";
import { enrichGenerateRecipeInput } from "@/lib/fitness/resolve-fitness-goals";
import { getProfileBodyFields } from "@/lib/queries/profile-fitness";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  let generationId: string | null = null;

  try {
    const { user, supabase } = await requireAuthenticatedClient(request);
    await assertAiRateLimit(user.id);
    ensureOpenAiConfigured();

    const body = await request.json();
    const parsed = scanAndGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
        "VALIDATION_ERROR",
      );
    }

    await assertPremiumRecipeMode(user.id, parsed.data.mode);

    const usage = await assertAiGenerationAllowed(user.id);
    await assertRecipesPerMonthLimit(user.id);

    const { imageUrl, storagePath } = await resolveScanImageUrl(
      supabase,
      user.id,
      parsed.data,
    );

    let scanData;
    let scanTokens = 0;

    const reusedScan =
      storagePath && !parsed.data.forceRegenerate
        ? await loadRecentScanByStoragePath(supabase, user.id, storagePath)
        : null;

    if (reusedScan) {
      scanData = reusedScan;
    } else {
      let scanResult;
      try {
        scanResult = await scanIngredientsFromImage(
          imageUrl,
          parsed.data.context,
        );
      } catch {
        throw new Error("SCAN_FAILED");
      }
      scanData = scanResult.data;
      scanTokens = scanResult.totalTokens;

      await insertIngredientScan({
        user_id: user.id,
        storage_path: storagePath ?? "inline-base64",
        detected_ingredients: scanData.ingredients,
        scene_description: scanData.sceneDescription,
      });
    }

    const ingredientNames = extractIngredientNames(scanData);
    if (ingredientNames.length === 0) {
      throw new Error("SCAN_FAILED");
    }

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
            sceneDescription: scanData.sceneDescription,
            suggestions: scanData.suggestions,
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
      tokens: scanTokens,
      combined: true,
      scan_reused: Boolean(reusedScan),
    });

    return apiSuccess({
      recipe,
      generationId,
      cached: false,
      scan: {
        ingredientNames,
        sceneDescription: scanData.sceneDescription,
        suggestions: scanData.suggestions,
      },
      usage: {
        used: usage.used + 1,
        limit: usage.limit,
        remaining: Math.max(usage.remaining - 1, 0),
      },
    });
  } catch (error) {
    if (generationId) {
      const supabase = await createClient(request);
      await markGenerationFailed(
        supabase,
        generationId,
        error instanceof Error ? error.message : "Erro desconhecido",
      );
    }
    return mapAiRouteError(error, "POST /api/v1/ai/scan-and-generate");
  }
}
