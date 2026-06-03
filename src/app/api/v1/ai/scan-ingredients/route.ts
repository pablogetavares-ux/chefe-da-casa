import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { assertAiGenerationAllowed } from "@/lib/ai/limits";
import {
  assertAiRateLimit,
  ensureOpenAiConfigured,
  mapAiRouteError,
} from "@/lib/ai/route-utils";
import {
  extractIngredientNames,
  scanIngredientsFromImage,
} from "@/lib/ai/services/scan";
import {
  addDetectedIngredientsToPantry,
  resolveScanImageUrl,
} from "@/lib/ai/services/scan-utils";
import { createClient } from "@/lib/supabase/server";
import {
  insertAiGeneration,
  insertIngredientScan,
  insertUsageLog,
} from "@/lib/supabase/service-records";
import { scanIngredientsSchema } from "@/lib/validations";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    await assertAiRateLimit(user.id);
    ensureOpenAiConfigured();

    const body = await request.json();
    const parsed = scanIngredientsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const usage = await assertAiGenerationAllowed(user.id);
    const supabase = await createClient();

    const { imageUrl, storagePath } = await resolveScanImageUrl(
      supabase,
      user.id,
      parsed.data,
    );

    let result;
    try {
      result = await scanIngredientsFromImage(imageUrl, parsed.data.context);
    } catch {
      throw new Error("SCAN_FAILED");
    }

    const ingredientNames = extractIngredientNames(result.data);

    if (ingredientNames.length === 0) {
      throw new Error("SCAN_FAILED");
    }

    const scanId = await insertIngredientScan({
      user_id: user.id,
      storage_path: storagePath ?? "inline-base64",
      detected_ingredients: result.data.ingredients,
      scene_description: result.data.sceneDescription,
    });

    let pantryAdded = 0;
    if (parsed.data.addToPantry) {
      pantryAdded = await addDetectedIngredientsToPantry(
        supabase,
        user.id,
        ingredientNames,
      );
    }

    await insertAiGeneration({
      user_id: user.id,
      model: result.model,
      status: "COMPLETED",
      input_snapshot: {
        action: "ai.scan_ingredients",
        storagePath: storagePath ?? null,
        context: parsed.data.context ?? null,
      },
      output_snapshot: result.data,
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.totalTokens,
      latency_ms: result.latencyMs,
    });

    await insertUsageLog(user.id, "ai.scan_ingredients", {
      scan_id: scanId,
      ingredient_count: ingredientNames.length,
      tokens: result.totalTokens,
    });

    return apiSuccess({
      scanId,
      ingredients: result.data.ingredients,
      ingredientNames,
      sceneDescription: result.data.sceneDescription,
      suggestions: result.data.suggestions,
      storagePath,
      pantryAdded,
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
