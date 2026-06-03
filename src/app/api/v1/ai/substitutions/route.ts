import { suggestSubstitutionsWithAI } from "@/lib/ai/services/substitutions";
import { substitutionsSchema } from "@/lib/validations";
import { handleAiRecipeMetadataUpdate } from "@/modules/ai/services/recipe-mutation-route";

export async function POST(request: Request) {
  return handleAiRecipeMetadataUpdate(request, {
    schema: substitutionsSchema,
    usageAction: "ai.substitutions",
    run: (recipe, input) => suggestSubstitutionsWithAI(recipe, input.reason),
    mergeSnapshot: (meta, data) => ({
      ...meta,
      substitutions: data.substitutions,
    }),
    buildResponse: (data) => ({
      substitutions: data.substitutions,
    }),
  });
}
