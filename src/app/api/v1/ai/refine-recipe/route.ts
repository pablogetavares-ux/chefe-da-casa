import { refineRecipeWithAI } from "@/lib/ai/services/refine";
import { refineRecipeSchema } from "@/lib/validations";
import { handleAiRecipeFullUpdate } from "@/modules/ai/services/recipe-mutation-route";

export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAiRecipeFullUpdate(request, {
    schema: refineRecipeSchema,
    operation: "REFINE",
    usageAction: "ai.refine_recipe",
    markAiGenerated: false,
    run: (existing, input) => refineRecipeWithAI(existing, input.instruction),
  });
}
