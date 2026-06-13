import { apiError, apiSuccess } from "@/lib/api/response";
import { assertPremiumFeature } from "@/lib/billing/assert-premium";
import { requireAuthUser } from "@/lib/api/auth";
import {
  assertAiGenerationAllowed,
  assertRecipesPerMonthLimit,
} from "@/lib/billing/plan-limits";
import {
  ensureOpenAiConfigured,
  mapAiRouteError,
  assertAiRateLimit,
} from "@/lib/ai/route-utils";
import {
  createAntiWastePendingGeneration,
  fetchAntiWasteSummary,
  generateAntiWasteRecipeWithAI,
  markAntiWasteGenerationFailed,
  saveAntiWasteRecipe,
  selectPriorityItems,
} from "@/lib/ai/services/anti-waste";
import type { AntiWastePantryItem } from "@/lib/queries/anti-waste";
import { createClient } from "@/lib/supabase/server";
import { antiWasteGenerateSchema } from "@/lib/validations";
import type { Recipe } from "@/types/database";

export const maxDuration = 60;

export async function POST(request: Request) {
  let generationId: string | null = null;

  try {
    const user = await requireAuthUser(request);
    await assertPremiumFeature(user.id, "Modo anti-desperdício");
    ensureOpenAiConfigured();
    await assertAiRateLimit(user.id);

    const body = await request.json();
    const parsed = antiWasteGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Dados inválidos",
        400,
      );
    }

    const usage = await assertAiGenerationAllowed(user.id);
    await assertRecipesPerMonthLimit(user.id);

    const supabase = await createClient();
    const summary = await fetchAntiWasteSummary(supabase, user.id);

    const atRiskItems = [
      ...summary.expired,
      ...summary.expiringSoon,
      ...summary.leftovers,
    ] as AntiWastePantryItem[];

    const atRiskById = new Map<string, AntiWastePantryItem>();
    for (const item of atRiskItems) atRiskById.set(item.id, item);

    const priorityItems = selectPriorityItems(
      [...atRiskById.values()],
      parsed.data.pantryItemIds,
    );

    if (priorityItems.length === 0) {
      return apiError(
        "Nenhum item vencendo ou sobra selecionado. Cadastre validades ou marque sobras na despensa.",
        400,
        "NO_ITEMS",
      );
    }

    const { data: pantryRows } = await supabase
      .from("pantry_items")
      .select("*")
      .eq("user_id", user.id);

    const supplementalIngredients = parsed.data.includeSupplementalPantry
      ? (pantryRows ?? [])
          .filter(
            (row) =>
              row.item_kind === "stock" &&
              !priorityItems.some((p) => p.id === row.id),
          )
          .map((row) => row.name)
          .slice(0, 10)
      : [];

    const params = {
      ...parsed.data,
      priorityItems,
      supplementalIngredients,
    };

    const pendingId = await createAntiWastePendingGeneration(user.id, params);
    generationId = pendingId;

    const result = await generateAntiWasteRecipeWithAI(params);
    const saved = await saveAntiWasteRecipe(
      supabase,
      user.id,
      params,
      result,
      pendingId,
    );

    return apiSuccess(
      {
        recipe: saved.recipe as Recipe,
        generationId,
        wasteReduction: saved.wasteReduction,
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
      await markAntiWasteGenerationFailed(
        generationId,
        error instanceof Error ? error.message : "Erro desconhecido",
      );
    }
    return mapAiRouteError(error);
  }
}
