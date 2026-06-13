import { calculateMacrosWithAI } from "@/lib/ai/services/macros";
import { macrosSchema } from "@/lib/validations";
import { handleAiRecipeMetadataUpdate } from "@/modules/ai/services/recipe-mutation-route";

export const maxDuration = 60;

export async function POST(request: Request) {
  return handleAiRecipeMetadataUpdate(request, {
    schema: macrosSchema,
    usageAction: "ai.macros",
    run: (recipe) => calculateMacrosWithAI(recipe),
    mergeSnapshot: (meta, data) => ({
      ...meta,
      nutrition: data.nutrition,
      macrosNotes: data.notes,
    }),
    buildResponse: (data) => ({
      nutrition: data.nutrition,
      notes: data.notes,
    }),
  });
}
