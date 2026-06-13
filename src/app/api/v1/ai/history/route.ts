import { throwIfSupabaseError } from "@/lib/api/supabase-errors";
import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ai_generations")
      .select(
        "id, status, created_at, recipe_id, input_snapshot, latency_ms, total_tokens, model, recipes(title)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    throwIfSupabaseError(error);

    const items =
      data?.map((item) => {
        const input = item.input_snapshot as {
          mode?: string;
          action?: string;
          ingredients?: string[];
          instruction?: string;
          targetDiet?: string;
        } | null;

        const recipeJoin = item.recipes as { title: string } | null;

        return {
          id: item.id,
          status: item.status,
          createdAt: item.created_at,
          recipeId: item.recipe_id,
          recipeTitle: recipeJoin?.title ?? null,
          mode: input?.mode ?? input?.action ?? "generate",
          summary: summarizeInput(input),
          latencyMs: item.latency_ms,
          totalTokens: item.total_tokens,
          model: item.model,
        };
      }) ?? [];

    return apiSuccess({ items });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/ai/history");
  }
}

function summarizeInput(
  input: {
    mode?: string;
    action?: string;
    ingredients?: string[];
    instruction?: string;
    targetDiet?: string;
  } | null,
) {
  if (!input) return "Geração IA";

  if (input.instruction) {
    return `Refino: ${input.instruction.slice(0, 80)}`;
  }

  if (input.targetDiet) {
    return `Adaptação: ${input.targetDiet}`;
  }

  if (input.ingredients?.length) {
    return `${input.ingredients.length} ingredientes · modo ${input.mode ?? "STANDARD"}`;
  }

  return input.action ?? "Operação IA";
}
