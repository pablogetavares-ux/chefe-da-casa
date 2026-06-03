import { apiError } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import {
  assertAiGenerationAllowed,
  assertRecipesPerMonthLimit,
} from "@/lib/billing/plan-limits";
import {
  createSseStream,
  createStructuredCompletionStream,
  sseResponse,
} from "@/lib/ai/core/completion";
import { findCachedRecipeGeneration } from "@/lib/ai/core/cache";
import {
  ensureOpenAiConfigured,
  mapAiRouteError,
  assertAiRateLimit,
} from "@/lib/ai/route-utils";
import { getModeDietaryDefaults } from "@/lib/ai/constants/recipe-modes";
import { isAiMockEnabled, mockGenerateRecipeStream } from "@/lib/ai/mock";
import { PROMPT_TEMPLATES } from "@/lib/ai/prompts";
import {
  generatedRecipeSchema,
  GENERATED_RECIPE_JSON_SCHEMA,
} from "@/lib/ai/schemas/recipe-output";
import {
  createPendingGeneration,
  getGenerateCacheKey,
  markGenerationFailed,
  saveGeneratedRecipe,
} from "@/lib/ai/services/generate";
import { createClient } from "@/lib/supabase/server";
import { generateRecipeSchema } from "@/lib/validations";
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
    const supabase = await createClient();
    const profile = await getProfileBodyFields(supabase, user.id);
    const input = enrichGenerateRecipeInput(parsed.data, profile);
    const cacheKey = getGenerateCacheKey(input);
    const mode = input.mode ?? "STANDARD";
    const dietaryPreferences = [
      ...new Set([
        ...getModeDietaryDefaults(mode),
        ...(input.dietaryPreferences ?? []),
      ]),
    ];

    if (!input.forceRegenerate) {
      const cached = await findCachedRecipeGeneration(user.id, cacheKey);
      if (cached) {
        const stream = createSseStream(async (send) => {
          send("cached", {
            recipe: cached.recipe,
            generationId: cached.generationId,
          });
          send("done", {
            recipe: cached.recipe,
            generationId: cached.generationId,
            cached: true,
            usage: {
              used: usage.used,
              limit: usage.limit,
              remaining: usage.remaining,
            },
          });
        });
        return sseResponse(stream);
      }
    }

    generationId = await createPendingGeneration(supabase, user.id, input);

    const stream = createSseStream(async (send) => {
      try {
        send("start", { generationId });

        const result = isAiMockEnabled()
          ? await mockGenerateRecipeStream(input, (text) => {
              send("delta", { text });
            })
          : await createStructuredCompletionStream(
              {
                system: PROMPT_TEMPLATES.recipeGeneration.system(mode),
                user: PROMPT_TEMPLATES.recipeGeneration.user(
                  input.ingredients,
                  {
                    preferences: dietaryPreferences.join(", "),
                    servings: input.servings,
                    maxPrepTimeMinutes: input.maxPrepTimeMinutes,
                    mode,
                    fitnessGoals: input.fitnessGoals,
                  },
                ),
                schema: GENERATED_RECIPE_JSON_SCHEMA,
                zodSchema: generatedRecipeSchema,
              },
              {
                onDelta: (_delta, fullText) => {
                  send("delta", { text: fullText });
                },
              },
            );

        const recipePayload = "recipe" in result ? result.recipe : result.data;

        const saved = await saveGeneratedRecipe(
          supabase,
          user.id,
          input,
          {
            recipe: recipePayload,
            model: result.model,
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
            totalTokens: result.totalTokens,
            latencyMs: result.latencyMs,
          },
          generationId!,
        );

        send("done", {
          recipe: saved,
          generationId,
          cached: false,
          usage: {
            used: usage.used + 1,
            limit: usage.limit,
            remaining: Math.max(usage.remaining - 1, 0),
          },
        });
      } catch (error) {
        if (generationId) {
          await markGenerationFailed(
            supabase,
            generationId,
            error instanceof Error ? error.message : "Erro desconhecido",
          );
        }
        throw error;
      }
    });

    return sseResponse(stream);
  } catch (error) {
    if (generationId) {
      const supabase = await createClient();
      await markGenerationFailed(
        supabase,
        generationId,
        error instanceof Error ? error.message : "Erro desconhecido",
      );
    }

    return mapAiRouteError(error, "POST /api/v1/ai/generate-recipe/stream");
  }
}
