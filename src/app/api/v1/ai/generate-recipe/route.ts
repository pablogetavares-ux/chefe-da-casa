import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { assertPremiumRecipeMode } from "@/lib/billing/assert-premium";
import {
  assertAiGenerationAllowed,
  assertRecipesPerMonthLimit,
} from "@/lib/billing/plan-limits";
import { findCachedRecipeGeneration } from "@/lib/ai/core/cache";
import {
  ensureOpenAiConfigured,
  mapAiRouteError,
  assertAiRateLimit,
} from "@/lib/ai/route-utils";
import {
  createPendingGeneration,
  generateRecipeWithAI,
  getGenerateCacheKey,
  markGenerationFailed,
  saveGeneratedRecipe,
} from "@/lib/ai/services/generate";
import { createClient } from "@/lib/supabase/server";
import { generateRecipeSchema } from "@/lib/validations";
import { enrichGenerateRecipeInput } from "@/lib/fitness/resolve-fitness-goals";
import { getProfileBodyFields } from "@/lib/queries/profile-fitness";
import type { Recipe } from "@/types/database";

export const maxDuration = 60;

export async function POST(request: Request) {
  let generationId: string | null = null;

  try {
    const user = await requireAuthUser();
    ensureOpenAiConfigured();
    await assertAiRateLimit(user.id);

    const body = await request.json();
    const parsed = generateRecipeSchema.safeParse(body);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path?.length ? issue.path.join(".") : "";
      const message = issue?.message ?? "Dados inválidos";
      return apiError(
        field ? `${field}: ${message}` : message,
        400,
        "VALIDATION_ERROR",
      );
    }

    const usage = await assertAiGenerationAllowed(user.id);
    await assertRecipesPerMonthLimit(user.id);
    await assertPremiumRecipeMode(user.id, parsed.data.mode);
    const supabase = await createClient();
    const profile = await getProfileBodyFields(supabase, user.id);
    const input = enrichGenerateRecipeInput(parsed.data, profile);
    const cacheKey = getGenerateCacheKey(input);

    if (!input.forceRegenerate) {
      const cached = await findCachedRecipeGeneration(user.id, cacheKey);
      if (cached) {
        return apiSuccess(
          {
            recipe: cached.recipe as Recipe,
            generationId: cached.generationId,
            cached: true,
            usage: {
              used: usage.used,
              limit: usage.limit,
              remaining: usage.remaining,
            },
          },
          200,
        );
      }
    }

    const pendingId = await createPendingGeneration(supabase, user.id, input);
    generationId = pendingId;

    const result = await generateRecipeWithAI(input);
    const recipe = await saveGeneratedRecipe(
      supabase,
      user.id,
      input,
      result,
      pendingId,
    );

    return apiSuccess(
      {
        recipe: recipe as Recipe,
        generationId,
        cached: false,
        usage: {
          used: usage.used + 1,
          limit: usage.limit,
          remaining: Math.max(usage.remaining - 1, 0),
        },
      },
      201,
    );
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
