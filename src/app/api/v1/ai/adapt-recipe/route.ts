import { adaptRecipeWithAI } from "@/lib/ai/services/adapt";
import { adaptRecipeSchema } from "@/lib/validations";
import { handleAiRecipeFullUpdate } from "@/modules/ai/services/recipe-mutation-route";

export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAiRecipeFullUpdate(request, {
    schema: adaptRecipeSchema,
    operation: "ADAPT",
    usageAction: "ai.adapt_recipe",
    run: (existing, input) =>
      adaptRecipeWithAI(existing, input.targetDiet, input.instruction),
  });
}
